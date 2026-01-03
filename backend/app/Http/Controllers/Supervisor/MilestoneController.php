<?php

namespace App\Http\Controllers\Supervisor;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectMilestoneResource;
use App\Models\Project;
use App\Models\ProjectMilestone;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MilestoneController extends Controller
{
    /**
     * Display a listing of milestones for a project
     */
    public function index(Request $request, Project $project): JsonResponse
    {
        if ($project->supervisor_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - You are not the supervisor of this project',
            ], 403);
        }

        $milestones = ProjectMilestone::where('project_id', $project->id)
            ->orderBy('due_date', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => ProjectMilestoneResource::collection($milestones),
        ]);
    }

    /**
     * Store a newly created milestone
     */
    public function store(Request $request, Project $project): JsonResponse
    {
        if ($project->supervisor_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - You are not the supervisor of this project',
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'due_date' => 'required|date|after_or_equal:today',
            'type' => 'required|in:document_submission,meeting,discussion,other',
        ]);

        $milestone = ProjectMilestone::create([
            'project_id' => $project->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'due_date' => $validated['due_date'],
            'type' => $validated['type'],
            'completed' => false,
        ]);

        return response()->json([
            'success' => true,
            'data' => new ProjectMilestoneResource($milestone),
            'message' => 'Milestone created successfully',
        ], 201);
    }

    /**
     * Update the specified milestone
     */
    public function update(Request $request, ProjectMilestone $milestone): JsonResponse
    {
        $project = $milestone->project;

        if ($project->supervisor_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - You are not the supervisor of this project',
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'due_date' => 'sometimes|required|date',
            'type' => 'sometimes|required|in:document_submission,meeting,discussion,other',
            'completed' => 'sometimes|boolean',
        ]);

        if (isset($validated['completed']) && $validated['completed'] && !$milestone->completed) {
            $validated['completed_at'] = now();
        } elseif (isset($validated['completed']) && !$validated['completed']) {
            $validated['completed_at'] = null;
        }

        $milestone->update($validated);

        return response()->json([
            'success' => true,
            'data' => new ProjectMilestoneResource($milestone->fresh()),
            'message' => 'Milestone updated successfully',
        ]);
    }

    /**
     * Remove the specified milestone
     */
    public function destroy(Request $request, ProjectMilestone $milestone): JsonResponse
    {
        $project = $milestone->project;

        if ($project->supervisor_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - You are not the supervisor of this project',
            ], 403);
        }

        $milestone->delete();

        return response()->json([
            'success' => true,
            'message' => 'Milestone deleted successfully',
        ]);
    }

    /**
     * Mark milestone as completed
     */
    public function markCompleted(Request $request, ProjectMilestone $milestone): JsonResponse
    {
        $project = $milestone->project;

        if ($project->supervisor_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - You are not the supervisor of this project',
            ], 403);
        }

        $milestone->update([
            'completed' => true,
            'completed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'data' => new ProjectMilestoneResource($milestone->fresh()),
            'message' => 'Milestone marked as completed',
        ]);
    }
}
