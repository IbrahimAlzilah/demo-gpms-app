<?php

namespace App\Http\Controllers\Supervisor;

use App\Http\Controllers\Controller;
use App\Http\Resources\GradeResource;
use App\Http\Resources\ProjectResource;
use App\Http\Traits\HasTableQuery;
use App\Models\Project;
use App\Services\ProjectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    use HasTableQuery;

    public function __construct(
        protected ProjectService $projectService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Project::where('supervisor_id', $request->user()->id)
            ->with([
                'supervisor', 
                'students.studentProfile', 
                'assignedGroup.leader', 
                'assignedGroup.members',
                'discussionCommittee' // Committee formation status
            ])
            ->withCount('students');

        $query = $this->applyTableQuery($query, $request);

        $result = $this->getPaginatedResponse($query, $request, ProjectResource::class);
        
        // Enhance each project with additional data
        if (isset($result['data']) && is_array($result['data'])) {
            foreach ($result['data'] as &$project) {
                $projectModel = Project::find($project['id']);
                
                // Add defense stage information
                $fd1Approval = \App\Models\DefenseApproval::where('project_id', $project['id'])
                    ->where('defense_stage', 'fd1')
                    ->first();
                    
                $fd2Approval = \App\Models\DefenseApproval::where('project_id', $project['id'])
                    ->where('defense_stage', 'fd2')
                    ->first();
                
                $project['defenseStage'] = [
                    'current' => $this->determineCurrentStage($fd1Approval, $fd2Approval),
                    'fd1Status' => $fd1Approval?->status ?? 'pending',
                    'fd1Locked' => $fd1Approval?->isLocked() ?? false,
                    'fd1Date' => $fd1Approval?->approved_at?->toISOString(),
                    'fd2Status' => $fd2Approval?->status ?? 'pending',
                    'fd2Locked' => $fd2Approval?->isLocked() ?? false,
                    'fd2Date' => $fd2Approval?->approved_at?->toISOString(),
                ];
                
                // Add committee formation status
                $hasCommittee = isset($project['discussionCommitteeId']) && $project['discussionCommitteeId'] !== null;
                $project['committeeStatus'] = $hasCommittee ? 'assigned' : 'not_assigned';
                
                // Add department/major from supervisor
                $project['department'] = $project['supervisor']['department'] ?? 'N/A';
                
                //Add group information
                if (isset($project['assignedGroup'])) {
                    $project['groupInfo'] = [
                        'code' => $project['assignedGroup']['code'] ?? 'N/A',
                        'name' => $project['assignedGroup']['name'] ?? 'N/A',
                        'memberCount' => count($project['assignedGroup']['members'] ?? []),
                    ];
                } else {
                    $project['groupInfo'] = [
                        'code' => 'N/A',
                        'name' => 'N/A',
                        'memberCount' => 0,
                    ];
                }
                
                // Add supervisor evaluation status for both FD1 and FD2
                $supervisorId = $request->user()->id;
                
                $fd1EvaluationCount = \App\Models\DefenseEvaluation::where('project_id', $project['id'])
                    ->where('evaluator_id', $supervisorId)
                    ->where('evaluator_role', 'supervisor')
                    ->where('defense_stage', 'fd1')
                    ->count();
                    
                $fd2EvaluationCount = \App\Models\DefenseEvaluation::where('project_id', $project['id'])
                    ->where('evaluator_id', $supervisorId)
                    ->where('evaluator_role', 'supervisor')
                    ->where('defense_stage', 'fd2')
                    ->count();
                
                $project['supervisorEvaluationStatus'] = [
                    'fd1' => [
                        'evaluated' => $fd1EvaluationCount > 0,
                        'evaluatedCount' => $fd1EvaluationCount,
                        'totalStudents' => $project['studentsCount'] ?? 0,
                        'isComplete' => $fd1EvaluationCount === ($project['studentsCount'] ?? 0),
                    ],
                    'fd2' => [
                        'evaluated' => $fd2EvaluationCount > 0,
                        'evaluatedCount' => $fd2EvaluationCount,
                        'totalStudents' => $project['studentsCount'] ?? 0,
                        'isComplete' => $fd2EvaluationCount === ($project['studentsCount'] ?? 0),
                    ],
                ];
            }
        }
        
        return response()->json($result);
    }
    
    private function determineCurrentStage($fd1Approval, $fd2Approval): string
    {
        // If FD1 is published, move to FD2
        if ($fd1Approval && $fd1Approval->status === 'published') {
            return 'fd2';
        }
        // Default to FD1
        return 'fd1';
    }

    public function show(Project $project): JsonResponse
    {
        if ($project->supervisor_id !== request()->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => new ProjectResource($project->load(['supervisor', 'students', 'assignedGroup.leader', 'assignedGroup.members', 'documents', 'grades.student', 'grades.project'])),
        ]);
    }

    /**
     * Get progress percentage for a project
     */
    public function getProgress(Request $request, Project $project): JsonResponse
    {
        if ($project->supervisor_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - You are not the supervisor of this project',
            ], 403);
        }

        $progressPercentage = $this->projectService->calculateProgressPercentage($project);

        return response()->json([
            'success' => true,
            'data' => [
                'progressPercentage' => $progressPercentage,
            ],
        ]);
    }

    /**
     * Get grades for a project
     */
    public function getGrades(Request $request, Project $project): JsonResponse
    {
        if ($project->supervisor_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - You are not the supervisor of this project',
            ], 403);
        }

        $grades = $project->grades()->with(['student', 'project'])->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => GradeResource::collection($grades),
        ]);
    }

    protected function applySearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        });
    }

    protected function applyFilters($query, array $filters)
    {
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        return $query;
    }
}

