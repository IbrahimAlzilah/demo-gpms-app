<?php

namespace App\Http\Controllers\ProjectsCommittee;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Services\ProjectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function __construct(
        protected ProjectService $projectService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $projects = Project::with(['supervisor', 'students'])->get();

        return response()->json([
            'success' => true,
            'data' => ProjectResource::collection($projects),
        ]);
    }

    public function announce(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_ids' => 'required|array',
            'project_ids.*' => 'exists:projects,id',
        ]);

        try {
            $projects = $this->projectService->announceProjects($validated['project_ids']);

            return response()->json([
                'success' => true,
                'data' => $projects,
                'message' => 'Projects announced successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}

