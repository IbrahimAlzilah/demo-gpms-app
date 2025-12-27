<?php

namespace App\Http\Controllers\ProjectsCommittee;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Http\Resources\UserResource;
use App\Models\Project;
use App\Models\User;
use App\Services\ProjectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupervisorController extends Controller
{
    public function __construct(
        protected ProjectService $projectService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $supervisors = User::where('role', 'supervisor')
            ->where('status', 'active')
            ->get();

        return response()->json([
            'success' => true,
            'data' => UserResource::collection($supervisors),
        ]);
    }

    public function assign(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'supervisor_id' => 'required|exists:users,id',
        ]);

        try {
            $project = Project::findOrFail($validated['project_id']);
            $supervisor = User::findOrFail($validated['supervisor_id']);

            if (!$supervisor->isSupervisor()) {
                return response()->json([
                    'success' => false,
                    'message' => 'User is not a supervisor',
                ], 400);
            }

            $updated = $this->projectService->assignSupervisor($project, $supervisor);

            return response()->json([
                'success' => true,
                'data' => new ProjectResource($updated->load(['supervisor'])),
                'message' => 'Supervisor assigned successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}

