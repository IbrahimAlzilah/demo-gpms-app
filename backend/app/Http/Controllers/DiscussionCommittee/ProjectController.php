<?php

namespace App\Http\Controllers\DiscussionCommittee;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $projects = Project::whereHas('committeeMembers', function ($q) use ($request) {
            $q->where('users.id', $request->user()->id);
        })
        ->where('status', 'in_progress')
        ->with(['supervisor', 'students', 'group'])
        ->get();

        return response()->json([
            'success' => true,
            'data' => ProjectResource::collection($projects),
        ]);
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
            'data' => new ProjectResource($project->load(['supervisor', 'students', 'group', 'grades'])),
        ]);
    }
}

