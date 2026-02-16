<?php

namespace App\Http\Controllers\ProjectsCommittee;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Http\Resources\UserResource;
use App\Http\Traits\HasTableQuery;
use App\Models\Project;
use App\Models\CommitteeAssignment;
use App\Models\CommitteeAssignmentHistory;
use App\Models\ProjectDefenseSchedule;
use App\Models\User;
use App\Models\Grade;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
        $query = Project::with([
            'supervisor.supervisorProfile',  // For department
            'students.studentProfile',       // For student details
            'assignedGroup.leader.studentProfile',  // For group leader
            'assignedGroup.members',         // For group members
            'committeeMembers',
            'documents',
            'defenseSchedules',
        ])
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
                    })
                    ->orWhereHas('assignedGroup', function ($sq) use ($search) {
                        $sq->where('group_code', 'like', "%{$search}%")
                           ->orWhere('name', 'like', "%{$search}%");
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

            // Add group information
            $groupInfo = [
                'code' => 'N/A',
                'name' => 'N/A',
                'memberCount' => 0,
                'leaderName' => 'N/A',
            ];
            
            if ($project->assignedGroup) {
                $groupInfo['code'] = $project->assignedGroup->group_code ?? $project->assignedGroup->name ?? 'N/A';
                $groupInfo['name'] = $project->assignedGroup->name ?? 'N/A';
                $groupInfo['memberCount'] = $project->assignedGroup->getTotalMemberCount(); // includes leader
                $groupInfo['leaderName'] = $project->assignedGroup->leader->name ?? 'N/A';
            } else {
                // Fallback: use students count if no group assigned
                $groupInfo['memberCount'] = $project->students->count();
            }
            
            $data['groupInfo'] = $groupInfo;
            $data['studentsCount'] = $project->students->count();
            
            // Add department (prioritize supervisor's department, fallback to student major)
            $department = 'N/A';
            if ($project->supervisor && $project->supervisor->supervisorProfile) {
                $department = $project->supervisor->supervisorProfile->department ?? 'N/A';
            } elseif ($project->assignedGroup && $project->assignedGroup->leader && $project->assignedGroup->leader->studentProfile) {
                $department = $project->assignedGroup->leader->studentProfile->major ?? 'N/A';
            }
            $data['department'] = $department;
            
            // Add workflow stage
            $data['workflowStage'] = $this->determineWorkflowStage($project);

            // Defense stage display (Final Defense-1 / Final Defense-2)
            $data['defenseStageDisplay'] = $readyForDefensePhase === 'final_defense_2' ? 'Final Defense-2' : ($readyForDefensePhase === 'final_defense_1' ? 'Final Defense-1' : null);

            // Defense date & time from schedule
            $defenseStageKey = $readyForDefensePhase === 'final_defense_2' ? 'FD2' : ($readyForDefensePhase === 'final_defense_1' ? 'FD1' : null);
            $schedule = $project->defenseSchedules?->firstWhere('defense_stage', $defenseStageKey);
            $data['defenseScheduledAt'] = $schedule?->scheduled_at?->toISOString();

            // For FD2 projects: show previous FD1 committee from history (for re-distribution context)
            $data['fd1CommitteePreview'] = null;
            if ($readyForDefensePhase === 'final_defense_2') {
                $fd1History = CommitteeAssignmentHistory::where('project_id', $project->id)
                    ->where('defense_stage', 'FD1')
                    ->where('action', 'assigned')
                    ->orderBy('created_at', 'desc')
                    ->first();
                if ($fd1History && !empty($fd1History->committee_member_ids)) {
                    $fd1Members = User::whereIn('id', $fd1History->committee_member_ids)->get(['id', 'name']);
                    $data['fd1CommitteePreview'] = $fd1Members->map(fn ($m) => ['id' => (string) $m->id, 'name' => $m->name])->values()->all();
                }
            }

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
     * Determine detailed workflow stage for a project
     */
    private function determineWorkflowStage(Project $project): string
    {
        // Check if grading is complete
        $hasApprovedGrades = Grade::where('project_id', $project->id)
            ->where('is_approved', true)
            ->whereNotNull('final_grade')
            ->exists();
            
        if ($hasApprovedGrades) {
            return 'grading_completed';
        }
        
        // Check if committee is assigned
        $hasCommittee = $project->committeeMembers->isNotEmpty();
        if ($hasCommittee) {
            return 'committee_evaluation';
        }
        
        // Check if documents have been submitted
        $hasDocuments = $project->documents->count() > 0;
        if ($hasDocuments) {
            return 'document_submission';
        }
        
        // Initial stage
        return 'initial_stage';
    }

    /**
     * Distribute/assign committee members to projects
     */
    public function distribute(Request $request): JsonResponse
    {
        $settingsService = app(\App\Services\SettingsService::class);
        $minMembers = $settingsService->getDiscussionCommitteeMinMembers();
        $maxMembers = $settingsService->getDiscussionCommitteeMaxMembers();
        $maxProjectsPerMember = $settingsService->get('committee_max_projects_per_member', 5);

        $validated = $request->validate([
            'assignments' => 'required|array',
            'assignments.*.project_id' => 'required|exists:projects,id',
            "assignments.*.committee_member_ids" => "required|array|min:{$minMembers}|max:{$maxMembers}",
            'assignments.*.committee_member_ids.*' => 'exists:users,id',
            'assignments.*.defense_stage' => 'required|in:FD1,FD2',
            'assignments.*.defense_scheduled_at' => 'nullable|date',
        ]);

        try {
            DB::beginTransaction();

            $projects = [];
            $notificationService = app(NotificationService::class);
            $performedBy = auth()->id();

            // Pre-validate all assignments
            foreach ($validated['assignments'] as $assignment) {
                $project = Project::with(['students', 'committeeMembers'])->findOrFail($assignment['project_id']);
                
                // Business Rule 1: Prevent re-assignment of already graded projects
                $hasApprovedGrades = Grade::where('project_id', $project->id)
                    ->whereIn('student_id', $project->students->pluck('id'))
                    ->where('is_approved', true)
                    ->whereNotNull('final_grade')
                    ->exists();
                
                if ($hasApprovedGrades && $project->committeeMembers->isNotEmpty()) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => "Cannot re-assign committee to project '{$project->title}' as it has already been graded and approved.",
                    ], 422);
                }

                // Business Rule 2: Validate max projects per member
                foreach ($assignment['committee_member_ids'] as $memberId) {
                    $currentAssignments = CommitteeAssignment::where('committee_member_id', $memberId)
                        ->whereHas('project', function ($q) {
                            $q->where('status', 'in_progress');
                        })
                        ->count();
                    
                    // Check if this member is not already assigned to this project
                    $alreadyAssigned = CommitteeAssignment::where('project_id', $project->id)
                        ->where('committee_member_id', $memberId)
                        ->exists();
                    
                    $effectiveCount = $alreadyAssigned ? $currentAssignments : $currentAssignments + 1;
                    
                    if ($effectiveCount > $maxProjectsPerMember) {
                        $member = User::find($memberId);
                        DB::rollBack();
                        return response()->json([
                            'success' => false,
                            'message' => "Committee member '{$member->name}' has reached the maximum limit of {$maxProjectsPerMember} projects.",
                        ], 422);
                    }
                }
            }

            // Process assignments
            foreach ($validated['assignments'] as $assignment) {
                $project = Project::with(['students', 'committeeMembers'])->findOrFail($assignment['project_id']);
                
                // Get previous assignments for audit trail
                $previousMembers = $project->committeeMembers->pluck('id')->toArray();
                $newMembers = $assignment['committee_member_ids'];
                
                // Determine action type
                $action = 'assigned';
                if (!empty($previousMembers)) {
                    $action = 'redistributed';
                }

                // Remove existing assignments
                CommitteeAssignment::where('project_id', $project->id)->delete();

                // Create new assignments
                foreach ($newMembers as $memberId) {
                    CommitteeAssignment::create([
                        'project_id' => $project->id,
                        'committee_member_id' => $memberId,
                    ]);
                }

                // Create audit trail
                CommitteeAssignmentHistory::create([
                    'project_id' => $project->id,
                    'action' => $action,
                    'committee_member_ids' => $newMembers,
                    'previous_committee_member_ids' => !empty($previousMembers) ? $previousMembers : null,
                    'defense_stage' => $assignment['defense_stage'],
                    'performed_by' => $performedBy,
                ]);

                // Store defense schedule (date + time)
                $scheduledAt = $assignment['defense_scheduled_at'] ?? null;
                ProjectDefenseSchedule::updateOrCreate(
                    ['project_id' => $project->id, 'defense_stage' => $assignment['defense_stage']],
                    ['scheduled_at' => $scheduledAt]
                );

                // Send notifications to assigned committee members
                $committeeMembers = User::whereIn('id', $newMembers)->get();
                foreach ($committeeMembers as $member) {
                    $message = json_encode([
                        'key' => 'notifications.committee.assigned',
                        'params' => [
                            'project_title' => $project->title,
                            'stage' => $assignment['defense_stage']
                        ]
                    ]);
                    
                    $notificationService->create(
                        $member,
                        $message,
                        'committee_assignment',
                        Project::class,
                        $project->id
                    );
                }

                $projects[] = $project->fresh()->load(['supervisor', 'students', 'committeeMembers']);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => ProjectResource::collection($projects),
                'message' => 'Committees distributed successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
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
        $settingsService = app(\App\Services\SettingsService::class);
        $maxProjectsPerMember = $settingsService->get('committee_max_projects_per_member', 5);

        $members = User::where('role', 'discussion_committee')
            ->where('status', 'active')
            ->with('supervisorProfile')
            ->get();

        // Enrich with assignment statistics
        $membersData = $members->map(function ($member) use ($maxProjectsPerMember) {
            // Get current active assignments
            $currentAssignments = CommitteeAssignment::where('committee_member_id', $member->id)
                ->whereHas('project', function ($q) {
                    $q->where('status', 'in_progress');
                })
                ->with('project:id,title,created_at')
                ->get();

            // Get completed project assignments (projects that are completed)
            $completedAssignments = CommitteeAssignment::where('committee_member_id', $member->id)
                ->whereHas('project', function ($q) {
                    $q->where('status', 'completed');
                })
                ->with('project:id,title,created_at,updated_at')
                ->get();

            // Get past assignments (all historical assignments)
            $pastAssignments = CommitteeAssignmentHistory::where('committee_member_ids', 'LIKE', '%"' . $member->id . '"%')
                ->with('project:id,title')
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($history) {
                    return [
                        'project_id' => (string) $history->project_id,
                        'project_title' => $history->project?->title,
                        'defense_stage' => $history->defense_stage,
                        'action' => $history->action,
                        'assigned_at' => $history->created_at->toISOString(),
                    ];
                });

            // Get total evaluations submitted by this member
            $evaluationsSubmitted = Grade::whereJsonContains('committee_grade->committeeMembers', (string) $member->id)
                ->count();

            // Get department and other profile details from supervisor profile if exists
            $department = $member->supervisorProfile?->department ?? null;
            $specialization = $member->supervisorProfile?->specialization ?? null;
            $officeLocation = $member->supervisorProfile?->office_location ?? null;
            $phone = $member->supervisorProfile?->phone ?? null;

            $currentCount = $currentAssignments->count();

            return [
                'id' => (string) $member->id,
                'name' => $member->name,
                'email' => $member->email,
                'username' => $member->username,
                'role' => $member->role,
                'status' => $member->status,
                'profile' => [
                    'department' => $department,
                    'specialization' => $specialization,
                    'office_location' => $officeLocation,
                    'phone' => $phone,
                ],
                'statistics' => [
                    'currentAssignments' => $currentCount,
                    'completedProjects' => $completedAssignments->count(),
                    'totalEvaluations' => $evaluationsSubmitted,
                    'maxAllowedProjects' => $maxProjectsPerMember,
                    'availableSlots' => max(0, $maxProjectsPerMember - $currentCount),
                ],
                'currentProjects' => $currentAssignments->map(function ($assignment) {
                    return [
                        'id' => (string) $assignment->project->id,
                        'title' => $assignment->project->title,
                        'assigned_at' => $assignment->created_at->toISOString(),
                    ];
                })->values(),
                'completedProjects' => $completedAssignments->map(function ($assignment) {
                    return [
                        'id' => (string) $assignment->project->id,
                        'title' => $assignment->project->title,
                        'completed_at' => $assignment->project->updated_at->toISOString(),
                    ];
                })->values(),
                'pastAssignments' => $pastAssignments,
                'availability' => $this->calculateAvailability($currentCount, $maxProjectsPerMember),
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
    private function calculateAvailability(int $currentAssignments, ?int $maxProjects = null): string
    {
        $settingsService = app(\App\Services\SettingsService::class);
        
        if ($maxProjects === null) {
            $maxProjects = $settingsService->get('committee_max_projects_per_member', 5);
        }
        
        $moderateThreshold = $settingsService->getCommitteeAvailabilityModerateThreshold();

        if ($currentAssignments === 0) {
            return 'available';
        } elseif ($currentAssignments >= $maxProjects) {
            return 'unavailable';
        } elseif ($currentAssignments <= $moderateThreshold) {
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
            DB::beginTransaction();

            // Get current assignments before removing
            $currentMembers = $project->committeeMembers->pluck('id')->toArray();

            if (empty($currentMembers)) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'No committee assignment found for this project',
                ], 404);
            }

            // Remove assignments
            CommitteeAssignment::where('project_id', $project->id)->delete();

            // Determine defense stage and remove schedule for current stage
            $fd1Completed = $this->isFinalDefensePhaseOneCompleted($project);
            $readyForFd2 = $fd1Completed && $this->isPhase2ChaptersComplete($project);
            $defenseStage = $readyForFd2 ? 'FD2' : 'FD1';
            ProjectDefenseSchedule::where('project_id', $project->id)->where('defense_stage', $defenseStage)->delete();

            // Create audit trail
            CommitteeAssignmentHistory::create([
                'project_id' => $project->id,
                'action' => 'removed',
                'committee_member_ids' => [],
                'previous_committee_member_ids' => $currentMembers,
                'defense_stage' => $defenseStage,
                'performed_by' => auth()->id(),
            ]);

            // Send notifications to removed committee members
            $notificationService = app(NotificationService::class);
            $committeeMembers = User::whereIn('id', $currentMembers)->get();
            
            foreach ($committeeMembers as $member) {
                $message = json_encode([
                    'key' => 'notifications.committee.removed',
                    'params' => [
                        'project_title' => $project->title
                    ]
                ]);
                
                $notificationService->create(
                    $member,
                    $message,
                    'committee_assignment',
                    Project::class,
                    $project->id
                );
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Committee assignment removed successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

}

