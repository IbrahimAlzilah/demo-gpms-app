<?php

namespace App\Http\Controllers\ProjectsCommittee;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Http\Resources\UserResource;
use App\Http\Traits\HasTableQuery;
use App\Models\Project;
use App\Models\CommitteeAssignment;
use App\Models\User;
use App\Models\Grade;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommitteeController extends Controller
{
    use HasTableQuery;

    /**
     * Get projects ready for final discussion / defense
     * These are projects in 'in_progress' status that have submitted documents
     * defense_phase: 'all' | 'final_defense_1' | 'final_defense_2'
     * - final_defense_1: Phase 1 chapters (1–3) all approved – ready for FD1 committee assignment
     * - final_defense_2: FD1 completed (grades approved) and Phase 2 chapters (4–6) all approved
     */
    public function projectsForDiscussion(Request $request): JsonResponse
    {
        $query = Project::with(['supervisor', 'students', 'assignedGroup.leader', 'committeeMembers', 'documents'])
            ->where('status', 'in_progress');

        // Apply status filter if provided
        if ($request->has('filter_status') && $request->filter_status !== 'all') {
            switch ($request->filter_status) {
                case 'unassigned':
                    $query->doesntHave('committeeMembers');
                    break;
                case 'assigned':
                    $query->has('committeeMembers');
                    break;
                case 'evaluated':
                    $query->whereHas('grades', function ($q) {
                        $q->whereNotNull('committee_grade');
                    });
                    break;
                case 'pending_evaluation':
                    $query->has('committeeMembers')
                        ->whereDoesntHave('grades', function ($q) {
                            $q->whereNotNull('committee_grade');
                        });
                    break;
            }
        }

        // Apply search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('supervisor', function ($sq) use ($search) {
                        $sq->where('name', 'like', "%{$search}%");
                    });
            });
        }

        $projects = $query->orderBy('created_at', 'desc')->get();

        // Apply defense phase filter (by readiness) and add readiness + phase to each project
        $defensePhase = $request->input('defense_phase', 'all');
        $projectsData = $projects->map(function ($project) use ($defensePhase) {
            $readyForFd1 = $this->isPhase1ChaptersComplete($project);
            $fd1Completed = $this->isFinalDefensePhaseOneCompleted($project);
            $readyForFd2 = $fd1Completed && $this->isPhase2ChaptersComplete($project);

            $readyForDefensePhase = null;
            if ($readyForFd2) {
                $readyForDefensePhase = 'final_defense_2';
            } elseif ($readyForFd1) {
                $readyForDefensePhase = 'final_defense_1';
            }

            // Filter by defense_phase when not 'all'
            if ($defensePhase !== 'all') {
                if ($defensePhase === 'final_defense_1' && !$readyForFd1) {
                    return null;
                }
                if ($defensePhase === 'final_defense_2' && !$readyForFd2) {
                    return null;
                }
            }

            $data = (new ProjectResource($project))->toArray(request());
            $data['documentCount'] = $project->documents->count();
            $data['hasCommitteeAssigned'] = $project->committeeMembers->isNotEmpty();
            $data['committeeCount'] = $project->committeeMembers->count();
            $data['readyForDefensePhase'] = $readyForDefensePhase;

            $evaluatedStudents = Grade::where('project_id', $project->id)
                ->whereNotNull('committee_grade')
                ->count();
            $totalStudents = $project->students->count();
            $data['evaluationProgress'] = [
                'evaluated' => $evaluatedStudents,
                'total' => $totalStudents,
                'percentage' => $totalStudents > 0 ? round(($evaluatedStudents / $totalStudents) * 100) : 0,
            ];

            return $data;
        })->filter()->values()->all();

        return response()->json([
            'success' => true,
            'data' => $projectsData,
        ]);
    }

    /**
     * Phase 1 chapters (1–3) all approved for the project
     */
    private function isPhase1ChaptersComplete(Project $project): bool
    {
        foreach ([1, 2, 3] as $chapter) {
            $approved = $project->documents()
                ->where('type', 'chapters')
                ->where('chapter_number', $chapter)
                ->where('review_status', 'approved')
                ->exists();
            if (!$approved) {
                return false;
            }
        }
        return true;
    }

    /**
     * Phase 2 chapters (4–6) all approved for the project
     */
    private function isPhase2ChaptersComplete(Project $project): bool
    {
        foreach ([4, 5, 6] as $chapter) {
            $approved = $project->documents()
                ->where('type', 'chapters')
                ->where('chapter_number', $chapter)
                ->where('review_status', 'approved')
                ->exists();
            if (!$approved) {
                return false;
            }
        }
        return true;
    }

    /**
     * Final Defense 1 completed: every student has an approved final grade
     */
    private function isFinalDefensePhaseOneCompleted(Project $project): bool
    {
        $studentIds = $project->students()->pluck('users.id');
        if ($studentIds->isEmpty()) {
            return false;
        }
        $grades = Grade::where('project_id', $project->id)
            ->whereIn('student_id', $studentIds)
            ->get()
            ->keyBy('student_id');
        foreach ($studentIds as $studentId) {
            $grade = $grades->get($studentId);
            if (!$grade || $grade->final_grade === null || !$grade->is_approved) {
                return false;
            }
        }
        return true;
    }

    /**
     * Distribute/assign committee members to projects
     */
    public function distribute(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'assignments' => 'required|array',
            'assignments.*.project_id' => 'required|exists:projects,id',
            'assignments.*.committee_member_ids' => 'required|array|min:2|max:3',
            'assignments.*.committee_member_ids.*' => 'exists:users,id',
        ]);

        try {
            $projects = [];
            foreach ($validated['assignments'] as $assignment) {
                $project = Project::findOrFail($assignment['project_id']);

                // Remove existing assignments
                CommitteeAssignment::where('project_id', $project->id)->delete();

                // Create new assignments
                foreach ($assignment['committee_member_ids'] as $memberId) {
                    CommitteeAssignment::create([
                        'project_id' => $project->id,
                        'committee_member_id' => $memberId,
                    ]);
                }

                $projects[] = $project->fresh()->load(['supervisor', 'students', 'committeeMembers']);
            }

            return response()->json([
                'success' => true,
                'data' => ProjectResource::collection($projects),
                'message' => 'Committees distributed successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get discussion committee members with detailed profiles and statistics
     */
    public function members(Request $request): JsonResponse
    {
        $members = User::where('role', 'discussion_committee')
            ->where('status', 'active')
            ->with('supervisorProfile')
            ->get();

        // Enrich with assignment statistics
        $membersData = $members->map(function ($member) {
            // Get current active assignments
            $currentAssignments = CommitteeAssignment::where('committee_member_id', $member->id)
                ->whereHas('project', function ($q) {
                    $q->where('status', 'in_progress');
                })
                ->with('project:id,title')
                ->get();

            // Get completed project assignments (projects that are completed)
            $completedAssignments = CommitteeAssignment::where('committee_member_id', $member->id)
                ->whereHas('project', function ($q) {
                    $q->where('status', 'completed');
                })
                ->count();

            // Get total evaluations submitted by this member
            $evaluationsSubmitted = Grade::whereJsonContains('committee_grade->committeeMembers', (string) $member->id)
                ->count();

            // Get department from supervisor profile if exists
            $department = $member->supervisorProfile?->department ?? null;

            return [
                'id' => (string) $member->id,
                'name' => $member->name,
                'email' => $member->email,
                'role' => $member->role,
                'status' => $member->status,
                'department' => $department,
                'statistics' => [
                    'currentAssignments' => $currentAssignments->count(),
                    'completedProjects' => $completedAssignments,
                    'totalEvaluations' => $evaluationsSubmitted,
                ],
                'currentProjects' => $currentAssignments->map(function ($assignment) {
                    return [
                        'id' => (string) $assignment->project->id,
                        'title' => $assignment->project->title,
                    ];
                })->values(),
                'availability' => $this->calculateAvailability($currentAssignments->count()),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $membersData,
        ]);
    }

    /**
     * Calculate member availability based on current assignments
     */
    private function calculateAvailability(int $currentAssignments): string
    {
        if ($currentAssignments === 0) {
            return 'available';
        } elseif ($currentAssignments <= 2) {
            return 'moderate';
        } else {
            return 'busy';
        }
    }

    /**
     * Remove committee assignment from a project
     */
    public function removeAssignment(Request $request, Project $project): JsonResponse
    {
        try {
            CommitteeAssignment::where('project_id', $project->id)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Committee assignment removed successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}

