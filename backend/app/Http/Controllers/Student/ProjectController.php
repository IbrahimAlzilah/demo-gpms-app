<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Http\Traits\HasTableQuery;
use App\Models\Project;
use App\Models\ProjectRegistration;
use App\Models\SupervisorNote;
use App\Models\ProjectMilestone;
use App\Models\ProjectMeeting;
use App\Services\ProjectService;
use App\Enums\ProjectStatus;
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
        $query = Project::with(['supervisor', 'students']);

        // Show available projects or student's registered projects
        if ($request->has('available') && $request->available) {
            $query->where('status', ProjectStatus::AVAILABLE_FOR_REGISTRATION->value);
        } else {
            $query->whereHas('students', function ($q) use ($request) {
                $q->where('users.id', $request->user()->id);
            });
        }

        $query = $this->applyTableQuery($query, $request);

        return response()->json($this->getPaginatedResponse($query, $request));
    }

    public function show(Request $request, Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        return response()->json([
            'success' => true,
            'data' => new ProjectResource($project->load(['supervisor', 'students', 'group'])),
        ]);
    }

    public function register(Request $request, Project $project): JsonResponse
    {
        $this->authorize('register', $project);

        try {
            $registration = $this->projectService->registerStudent($project, $request->user());

            return response()->json([
                'success' => true,
                'data' => $registration,
                'message' => 'Registration submitted successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function getRegistrations(Request $request): JsonResponse
    {
        $registrations = ProjectRegistration::where('student_id', $request->user()->id)
            ->with(['project', 'reviewer'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $registrations,
        ]);
    }

    public function cancelRegistration(Request $request, ProjectRegistration $registration): JsonResponse
    {
        if ($registration->student_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to cancel this registration',
            ], 403);
        }

        if (!in_array($registration->status, ['pending', 'approved'])) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot cancel registration in current status',
            ], 400);
        }

        try {
            if ($registration->status === 'approved') {
                $project = $registration->project;
                $project->students()->detach($registration->student_id);
                $project->decrement('current_students');
            }

            $registration->update(['status' => 'cancelled']);

            return response()->json([
                'success' => true,
                'message' => 'Registration cancelled successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    protected function applySearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        });
    }

    /**
     * Get supervisor notes for a project
     */
    public function getSupervisorNotes(Request $request, Project $project): JsonResponse
    {
        // Verify student is registered in this project
        if (!$project->students()->where('users.id', $request->user()->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - You are not registered in this project',
            ], 403);
        }

        $notes = SupervisorNote::where('project_id', $project->id)
            ->with(['supervisor', 'replies.author'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $notes,
        ]);
    }

    /**
     * Reply to a supervisor note
     */
    public function replyToNote(Request $request, Project $project, SupervisorNote $note): JsonResponse
    {
        // Verify student is registered in this project
        if (!$project->students()->where('users.id', $request->user()->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - You are not registered in this project',
            ], 403);
        }

        // Verify note belongs to this project
        if ($note->project_id !== $project->id) {
            return response()->json([
                'success' => false,
                'message' => 'Note does not belong to this project',
            ], 400);
        }

        $validated = $request->validate([
            'content' => 'required|string|max:5000',
        ]);

        $reply = \App\Models\NoteReply::create([
            'note_id' => $note->id,
            'author_id' => $request->user()->id,
            'content' => $validated['content'],
        ]);

        return response()->json([
            'success' => true,
            'data' => $reply->load(['author']),
            'message' => 'Reply added successfully',
        ], 201);
    }

    /**
     * Get milestones for a project
     */
    public function getMilestones(Request $request, Project $project): JsonResponse
    {
        // Verify student is registered in this project
        if (!$project->students()->where('users.id', $request->user()->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - You are not registered in this project',
            ], 403);
        }

        $milestones = ProjectMilestone::where('project_id', $project->id)
            ->orderBy('due_date', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $milestones,
        ]);
    }

    /**
     * Get meetings for a project
     */
    public function getMeetings(Request $request, Project $project): JsonResponse
    {
        // Verify student is registered in this project
        if (!$project->students()->where('users.id', $request->user()->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - You are not registered in this project',
            ], 403);
        }

        $meetings = ProjectMeeting::where('project_id', $project->id)
            ->with(['scheduledBy', 'attendees'])
            ->orderBy('scheduled_date', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $meetings,
        ]);
    }

    /**
     * Get progress percentage for a project
     */
    public function getProgress(Request $request, Project $project): JsonResponse
    {
        // Verify student is registered in this project
        if (!$project->students()->where('users.id', $request->user()->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - You are not registered in this project',
            ], 403);
        }

        $progressPercentage = $this->projectService->calculateProgressPercentage($project);

        return response()->json([
            'success' => true,
            'data' => [
                'progress_percentage' => $progressPercentage,
            ],
        ]);
    }

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

