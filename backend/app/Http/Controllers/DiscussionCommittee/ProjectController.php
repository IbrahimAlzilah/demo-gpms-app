<?php

namespace App\Http\Controllers\DiscussionCommittee;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Http\Traits\HasTableQuery;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    use HasTableQuery;

    public function index(Request $request): JsonResponse
    {
        $committeeMember = $request->user();
        
        $query = Project::whereHas('committeeMembers', function ($q) use ($committeeMember) {
            $q->where('users.id', $committeeMember->id);
        })
        ->where('status', 'in_progress')
        ->withCount([
            'documents',
            'grades',
            'students',
            'documents as documents_approved_count' => function ($q) {
                $q->where('review_status', 'approved');
            },
        ])
        ->with([
            'supervisor.supervisorProfile', // For department
            'students.studentProfile', // For student details
            'assignedGroup.leader',
            'assignedGroup.members',
        ]);

        $query = $this->applyTableQuery($query, $request);

        // Get paginated data
        $paginatedData = $this->getPaginatedResponse($query, $request, ProjectResource::class);
        
        // Enhance each project with evaluation status for this committee member
        if (isset($paginatedData['data'])) {
            foreach ($paginatedData['data'] as &$project) {
                // Determine current defense stage based on evaluations and approvals
                $fd1Approval = \App\Models\DefenseApproval::where('project_id', $project['id'])
                    ->where('defense_stage', 'fd1')
                    ->first();
                    
                $fd2Approval = \App\Models\DefenseApproval::where('project_id', $project['id'])
                    ->where('defense_stage', 'fd2')
                    ->first();
                
                // Determine current stage
                $currentStage = $this->determineCurrentStage($fd1Approval, $fd2Approval);
                
                // Get evaluation count for this specific committee member for the CURRENT stage
                $myEvaluationCount = \App\Models\DefenseEvaluation::where('project_id', $project['id'])
                    ->where('evaluator_id', $committeeMember->id)
                    ->where('defense_stage', $currentStage)
                    ->count();
                
                // Add evaluation status (for current stage)
                $project['evaluationStatus'] = [
                    'myEvaluatedCount' => $myEvaluationCount,
                    'totalStudents' => $project['studentsCount'] ?? 0,
                    'percentage' => $project['studentsCount'] > 0 
                        ? round(($myEvaluationCount / $project['studentsCount']) * 100, 2) 
                        : 0,
                    'isComplete' => $myEvaluationCount === ($project['studentsCount'] ?? 0),
                ];
                
                // Add defense stage info
                $project['defenseStage'] = [
                    'current' => $currentStage,
                    'fd1Status' => $fd1Approval?->status ?? 'pending',
                    'fd1Locked' => $fd1Approval?->isLocked() ?? false,
                    'fd2Status' => $fd2Approval?->status ?? 'pending',
                    'fd2Locked' => $fd2Approval?->isLocked() ?? false,
                ];
                
                // Add department from supervisor
                if (isset($project['supervisor'])) {
                    $project['department'] = $project['supervisor']['department'] ?? 'N/A';
                } else {
                    $project['department'] = 'N/A';
                }
                
                // Add group information
                if (isset($project['assignedGroup'])) {
                    $project['groupInfo'] = [
                        'code' => $project['assignedGroup']['groupCode'] ?? $project['assignedGroup']['code'] ?? 'N/A',
                        'memberCount' => (int) ($project['assignedGroup']['memberCount'] ?? count($project['assignedGroup']['members'] ?? [])),
                        'leaderName' => $project['assignedGroup']['leader']['name'] ?? 'N/A',
                    ];
                } else {
                    $project['groupInfo'] = [
                        'code' => 'N/A',
                        'memberCount' => 0,
                        'leaderName' => 'N/A',
                    ];
                }
            }
        }

        return response()->json($paginatedData);
    }
    
    /**
     * Determine current defense stage based on approval status
     */
    private function determineCurrentStage($fd1Approval, $fd2Approval): string
    {
        // If FD2 is published or approved, we're in FD2
        if ($fd2Approval && in_array($fd2Approval->status, ['approved', 'published'])) {
            return 'fd2';
        }
        
        // If FD1 is published, we're between stages or starting FD2
        if ($fd1Approval && $fd1Approval->status === 'published') {
            return 'fd2';
        }
        
        // If FD1 is approved but not published, still in FD1
        if ($fd1Approval && $fd1Approval->status === 'approved') {
            return 'fd1';
        }
        
        // Default to FD1
        return 'fd1';
    }

    public function show(Project $project): JsonResponse
    {
        $isAssigned = $project->committeeMembers()->where('users.id', request()->user()->id)->exists();

        if (!$isAssigned) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => new ProjectResource($project->load([
                'supervisor',
                'students',
                'assignedGroup.leader',
                'assignedGroup.members',
                'documents.submitter',
                'grades.student',
                'committeeMembers',
            ])),
        ]);
    }

    /**
     * Apply search to query
     */
    protected function applySearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%")
                ->orWhere('specialization', 'like', "%{$search}%");
        });
    }

    /**
     * Apply filters to query
     */
    protected function applyFilters($query, array $filters)
    {
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (isset($filters['specialization'])) {
            $query->where('specialization', $filters['specialization']);
        }
        return $query;
    }
}

