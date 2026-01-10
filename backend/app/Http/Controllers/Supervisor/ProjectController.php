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
            ->with(['supervisor', 'students', 'group']);

        $query = $this->applyTableQuery($query, $request);

        return response()->json($this->getPaginatedResponse($query, $request, ProjectResource::class));
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
            'data' => new ProjectResource($project->load(['supervisor', 'students', 'group', 'documents', 'grades.student', 'grades.project'])),
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

        $grades = $project->grades()->with(['student', 'project'])->get();

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

