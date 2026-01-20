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
        $query = Project::with(['supervisor', 'students', 'assignedGroup.leader', 'assignedGroup.members', 'group.members', 'group.leader']);

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
            'data' => new ProjectResource($project->load(['supervisor', 'students', 'assignedGroup.leader', 'assignedGroup.members', 'group'])),
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

        // Require student_group_id
        $validated = $request->validate([
            'student_group_id' => 'required|exists:student_groups,id',
        ]);

        $studentGroup = \App\Models\StudentGroup::findOrFail($validated['student_group_id']);

        // Validate student is a member of the group
        if (!$studentGroup->hasMember($user->id) && $studentGroup->leader_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You must be a member of the selected group to register',
            ], 403);
        }

        // Validate group meets registration requirements (min 2, max 5 members)
        if (!$studentGroup->meetsRegistrationRequirements()) {
            $minMembers = app(\App\Services\SettingsService::class)->getGroupMinMembers();
            $maxMembers = app(\App\Services\SettingsService::class)->getGroupMaxMembers();
            $totalMembers = $studentGroup->getTotalMemberCount();
            
            if ($totalMembers < $minMembers) {
                return response()->json([
                    'success' => false,
                    'message' => "Group must have at least {$minMembers} members to register for a project",
                ], 403);
            }
            
            if ($totalMembers > $maxMembers) {
                return response()->json([
                    'success' => false,
                    'message' => "Group cannot have more than {$maxMembers} members to register for a project",
                ], 403);
            }
        }

        // Check if project is already assigned to another group
        if ($project->assigned_group_id && $project->assigned_group_id !== $studentGroup->id) {
            return response()->json([
                'success' => false,
                'message' => 'Project is already assigned to another group',
            ], 403);
        }

        if (!$project->isAvailableForRegistration()) {
            return response()->json([
                'success' => false,
                'message' => 'Project is not available for registration',
            ], 403);
        }

        // Check if any group member is already registered in this project
        $groupMembers = $studentGroup->members()->pluck('users.id')->push($studentGroup->leader_id)->unique();
        $alreadyRegistered = $project->students()->whereIn('users.id', $groupMembers)->exists();
        
        if ($alreadyRegistered) {
            return response()->json([
                'success' => false,
                'message' => 'One or more group members are already registered in this project',
            ], 403);
        }

        // Check if group already has a pending registration for this project
        $existingRegistration = ProjectRegistration::where('project_id', $project->id)
            ->whereIn('student_id', $groupMembers)
            ->where('status', 'pending')
            ->exists();

        if ($existingRegistration) {
            return response()->json([
                'success' => false,
                'message' => 'Group already has a pending registration for this project',
            ], 403);
        }

        // Check if any group member already has an approved project registration
        $hasProject = Project::whereHas('students', function ($query) use ($groupMembers) {
            $query->whereIn('users.id', $groupMembers);
        })->exists();

        if ($hasProject) {
            return response()->json([
                'success' => false,
                'message' => 'One or more group members are already registered in another project',
            ], 403);
        }

        try {
            $registration = $this->projectService->registerStudentGroup($project, $studentGroup, $user);

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
        // After migration backfill, all students in project_student should have corresponding
        // project_registrations records, so we only return real database records
        $registrations = ProjectRegistration::where('student_id', $student->id)
            ->with(['project', 'reviewer'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => ProjectRegistrationResource::collection($registrations),
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

        // Only allow cancelling pending registrations to avoid partially cancelling
        // group-based approved registrations (which would create inconsistent state)
        if ($registration->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending registrations can be cancelled. Approved registrations cannot be cancelled.',
            ], 400);
        }

        try {
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

