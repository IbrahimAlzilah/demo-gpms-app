<?php

namespace App\Http\Controllers\ProjectsCommittee;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Services\ProjectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupervisorController extends Controller
{
    public function __construct(
        protected ProjectService $projectService
    ) {}

    public function assign(Request $request, Project $project): JsonResponse
    {
        $validated = $request->validate([
            'supervisor_id' => 'required|exists:users,id',
        ]);

        try {
            $supervisor = \App\Models\User::findOrFail($validated['supervisor_id']);
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

