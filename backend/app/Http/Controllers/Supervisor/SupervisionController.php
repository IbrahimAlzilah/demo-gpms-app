<?php

namespace App\Http\Controllers\Supervisor;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Http\Traits\HasTableQuery;
use App\Models\Project;
use App\Services\ProjectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupervisionController extends Controller
{
    use HasTableQuery;

    public function __construct(
        protected ProjectService $projectService
    ) {}

    public function index(Request $request): JsonResponse
    {
        // Get projects assigned to this supervisor pending approval
        $query = Project::where('supervisor_id', $request->user()->id)
            ->where('supervisor_approval_status', 'pending')
            ->with(['supervisor', 'students']);

        $query = $this->applyTableQuery($query, $request);

        return response()->json($this->getPaginatedResponse($query, $request, ProjectResource::class));
    }

    public function approve(Request $request, Project $project): JsonResponse
    {
        try {
            $approved = $this->projectService->approveSupervisorAssignment(
                $project,
                $request->user(),
                $request->input('comments')
            );

            return response()->json([
                'success' => true,
                'data' => new ProjectResource($approved->load(['supervisor', 'students'])),
                'message' => 'Project assignment approved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function reject(Request $request, Project $project): JsonResponse
    {
        try {
            $rejected = $this->projectService->rejectSupervisorAssignment(
                $project,
                $request->user(),
                $request->input('comments')
            );

            return response()->json([
                'success' => true,
                'data' => new ProjectResource($rejected->load(['supervisor', 'students'])),
                'message' => 'Project assignment rejected',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}

