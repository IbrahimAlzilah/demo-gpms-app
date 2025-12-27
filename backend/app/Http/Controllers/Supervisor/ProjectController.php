<?php

namespace App\Http\Controllers\Supervisor;

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
        $query = Project::where('supervisor_id', $request->user()->id)
            ->with(['supervisor', 'students', 'group']);

        $query = $this->applyTableQuery($query, $request);

        return response()->json($this->getPaginatedResponse($query, $request));
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
            'data' => new ProjectResource($project->load(['supervisor', 'students', 'group', 'documents', 'grades'])),
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

