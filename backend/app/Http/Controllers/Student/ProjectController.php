<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Resources\NoteReplyResource;
use App\Http\Resources\ProjectMeetingResource;
use App\Http\Resources\ProjectMilestoneResource;
use App\Http\Resources\ProjectRegistrationResource;
use App\Http\Resources\ProjectResource;
use App\Http\Resources\SupervisorNoteResource;
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

        // Check if requesting available projects via 'available' parameter or filters
        $filters = $request->filters ?? [];
        $isRequestingAvailable = ($request->has('available') && $request->available) 
            || (isset($filters['status']) && $filters['status'] === ProjectStatus::AVAILABLE_FOR_REGISTRATION->value);

        // Show available projects or student's registered projects
        if ($isRequestingAvailable) {
            $query->where('status', ProjectStatus::AVAILABLE_FOR_REGISTRATION->value);
        } else {
            $query->whereHas('students', function ($q) use ($request) {
                $q->where('users.id', $request->user()->id);
            });
        }

        $query = $this->applyTableQuery($query, $request);

        return response()->json($this->getPaginatedResponse($query, $request, ProjectResource::class));
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
        $user = $request->user();

        // Check authorization with specific error messages
        if (!$user->isStudent()) {
            return response()->json([
                'success' => false,
                'message' => 'Only students can register for projects',
            ], 403);
        }

        if (!$project->isAvailableForRegistration()) {
            return response()->json([
                'success' => false,
                'message' => 'Project is not available for registration',
            ], 403);
        }

        if ($project->students()->where('users.id', $user->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'You are already registered in this project',
            ], 403);
        }

        // Check if student already has a pending registration for this project
        $existingRegistration = ProjectRegistration::where('student_id', $user->id)
            ->where('project_id', $project->id)
            ->where('status', 'pending')
            ->exists();

        if ($existingRegistration) {
            return response()->json([
                'success' => false,
                'message' => 'You already have a pending registration for this project',
            ], 403);
        }

        // Check if student already has a pending registration for any project
        $hasPendingRegistration = ProjectRegistration::where('student_id', $user->id)
            ->where('status', 'pending')
            ->exists();

        if ($hasPendingRegistration) {
            return response()->json([
                'success' => false,
                'message' => 'You already have a pending registration for another project',
            ], 403);
        }

        // Check if student already has an approved project
        $hasProject = Project::whereHas('students', function ($query) use ($user) {
            $query->where('users.id', $user->id);
        })->exists();

        if ($hasProject) {
            return response()->json([
                'success' => false,
                'message' => 'You are already registered in another project',
            ], 403);
        }

        try {
            $registration = $this->projectService->registerStudent($project, $user);

            return response()->json([
                'success' => true,
                'data' => new ProjectRegistrationResource($registration->load(['project', 'student'])),
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
        $student = $request->user();
        
        // Get all ProjectRegistration records for the student
        $registrations = ProjectRegistration::where('student_id', $student->id)
            ->with(['project', 'reviewer'])
            ->get();

        // Get all projects where the student is directly attached via students relationship
        $attachedProjects = Project::whereHas('students', function ($q) use ($student) {
            $q->where('users.id', $student->id);
        })
        ->with(['supervisor', 'students' => function ($q) use ($student) {
            $q->where('users.id', $student->id);
        }])
        ->get();

        // Get project IDs that already have approved registration records
        $approvedRegistrationProjectIds = $registrations
            ->where('status', 'approved')
            ->pluck('project_id')
            ->toArray();

        // Create synthetic registration records for projects where student is attached
        // but doesn't have an approved registration record
        $syntheticRegistrations = collect();
        foreach ($attachedProjects as $project) {
            if (!in_array($project->id, $approvedRegistrationProjectIds)) {
                // Get pivot data for timestamps
                $pivot = $project->students->first()?->pivot;
                $pivotCreatedAt = $pivot->created_at ?? now();
                $pivotUpdatedAt = $pivot->updated_at ?? now();
                
                // Create a synthetic ProjectRegistration instance (not saved to DB)
                $syntheticRegistration = new ProjectRegistration([
                    'project_id' => $project->id,
                    'student_id' => $student->id,
                    'status' => 'approved',
                    'submitted_at' => $pivotCreatedAt,
                    'reviewed_at' => $pivotUpdatedAt,
                    'reviewed_by' => null,
                    'review_comments' => null,
                ]);
                
                // Set the project relationship
                $syntheticRegistration->setRelation('project', $project);
                $syntheticRegistration->setRelation('reviewer', null);
                
                // Set ID to a unique synthetic ID to avoid conflicts
                $syntheticRegistration->id = 'synthetic_' . $project->id;
                
                $syntheticRegistrations->push($syntheticRegistration);
            }
        }

        // Merge real registrations with synthetic ones
        $allRegistrations = $registrations->merge($syntheticRegistrations);

        return response()->json([
            'success' => true,
            'data' => ProjectRegistrationResource::collection($allRegistrations),
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
            'data' => SupervisorNoteResource::collection($notes),
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
            'data' => new NoteReplyResource($reply->load(['author'])),
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
            'data' => ProjectMilestoneResource::collection($milestones),
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
            'data' => ProjectMeetingResource::collection($meetings),
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
                'progressPercentage' => $progressPercentage,
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

