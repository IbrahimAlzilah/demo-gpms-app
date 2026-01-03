<?php

namespace App\Http\Controllers\Supervisor;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectMeetingResource;
use App\Models\Project;
use App\Models\ProjectMeeting;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MeetingController extends Controller
{
    /**
     * Display a listing of meetings for a project
     */
    public function index(Request $request, Project $project): JsonResponse
    {
        if ($project->supervisor_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - You are not the supervisor of this project',
            ], 403);
        }

        $meetings = ProjectMeeting::where('project_id', $project->id)
            ->with(['scheduledBy', 'attendees'])
            ->orderBy('scheduled_date', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => ProjectMeetingResource::collection($meetings),
        ]);
    }

    /**
     * Store a newly created meeting
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
            'scheduled_date' => 'required|date|after_or_equal:now',
            'duration' => 'nullable|integer|min:15|max:480',
            'location' => 'nullable|string|max:255',
            'agenda' => 'nullable|string|max:5000',
            'attendee_ids' => 'nullable|array',
            'attendee_ids.*' => 'exists:users,id',
        ]);

        $meeting = ProjectMeeting::create([
            'project_id' => $project->id,
            'scheduled_by' => $request->user()->id,
            'scheduled_date' => $validated['scheduled_date'],
            'duration' => $validated['duration'] ?? 60,
            'location' => $validated['location'] ?? null,
            'agenda' => $validated['agenda'] ?? null,
        ]);

        // Attach attendees if provided
        if (isset($validated['attendee_ids']) && !empty($validated['attendee_ids'])) {
            // Verify attendees are students in this project
            $projectStudentIds = $project->students()->pluck('users.id')->toArray();
            $validAttendeeIds = array_intersect($validated['attendee_ids'], $projectStudentIds);
            
            if (!empty($validAttendeeIds)) {
                $meeting->attendees()->attach($validAttendeeIds);
            }
        }

        return response()->json([
            'success' => true,
            'data' => new ProjectMeetingResource($meeting->load(['scheduledBy', 'attendees'])),
            'message' => 'Meeting scheduled successfully',
        ], 201);
    }

    /**
     * Update the specified meeting
     */
    public function update(Request $request, ProjectMeeting $meeting): JsonResponse
    {
        $project = $meeting->project;

        if ($project->supervisor_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - You are not the supervisor of this project',
            ], 403);
        }

        $validated = $request->validate([
            'scheduled_date' => 'sometimes|required|date',
            'duration' => 'nullable|integer|min:15|max:480',
            'location' => 'nullable|string|max:255',
            'agenda' => 'nullable|string|max:5000',
            'notes' => 'nullable|string|max:5000',
            'attendee_ids' => 'nullable|array',
            'attendee_ids.*' => 'exists:users,id',
        ]);

        $meeting->update($validated);

        // Update attendees if provided
        if (isset($validated['attendee_ids'])) {
            $projectStudentIds = $project->students()->pluck('users.id')->toArray();
            $validAttendeeIds = array_intersect($validated['attendee_ids'], $projectStudentIds);
            $meeting->attendees()->sync($validAttendeeIds);
        }

        return response()->json([
            'success' => true,
            'data' => new ProjectMeetingResource($meeting->fresh()->load(['scheduledBy', 'attendees'])),
            'message' => 'Meeting updated successfully',
        ]);
    }

    /**
     * Remove the specified meeting
     */
    public function destroy(Request $request, ProjectMeeting $meeting): JsonResponse
    {
        $project = $meeting->project;

        if ($project->supervisor_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - You are not the supervisor of this project',
            ], 403);
        }

        $meeting->delete();

        return response()->json([
            'success' => true,
            'message' => 'Meeting deleted successfully',
        ]);
    }
}
