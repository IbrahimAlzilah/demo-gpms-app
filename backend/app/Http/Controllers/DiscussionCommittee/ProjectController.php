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
        $query = Project::whereHas('committeeMembers', function ($q) use ($request) {
            $q->where('users.id', $request->user()->id);
        })
        ->where('status', 'in_progress')
        ->with(['supervisor', 'students', 'assignedGroup.leader', 'assignedGroup.members']);

        $query = $this->applyTableQuery($query, $request);

        return response()->json($this->getPaginatedResponse($query, $request, ProjectResource::class));
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
                'documents',
                'grades',
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

