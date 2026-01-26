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
        $user = $request->user();
        $query = Project::with(['supervisor', 'students', 'assignedGroup.leader', 'assignedGroup.members']);

        // Check if requesting available projects via 'available' parameter or filters
        $filters = $request->filters ?? [];
        $isRequestingAvailable = ($request->has('available') && $request->available) 
            || (isset($filters['status']) && $filters['status'] === ProjectStatus::AVAILABLE_FOR_REGISTRATION->value);

        if ($isRequestingAvailable) {
            // Show only available projects (legacy behavior)
            $query->where('status', ProjectStatus::AVAILABLE_FOR_REGISTRATION->value);
        } else {
            // Show all visible projects published by Project Committee
            // Include projects with status: ANNOUNCED, AVAILABLE_FOR_REGISTRATION, IN_PROGRESS, COMPLETED
            // Also include projects linked to the student's group leader
            
            // Get the student's group (if they are leader or member)
            $userGroup = \App\Models\StudentGroup::where(function ($q) use ($user) {
                $q->where('leader_id', $user->id)
                    ->orWhereHas('members', function ($memberQuery) use ($user) {
                        $memberQuery->where('users.id', $user->id);
                    });
            })
            ->where('status', 'active')
            ->first();

            // Build query: visible projects OR projects assigned to student's group
            $query->where(function ($q) use ($userGroup) {
                // All visible projects published by Project Committee
                $q->whereIn('status', [
                    ProjectStatus::ANNOUNCED->value,
                    ProjectStatus::AVAILABLE_FOR_REGISTRATION->value,
                    ProjectStatus::IN_PROGRESS->value,
                    ProjectStatus::COMPLETED->value,
                ]);
                
                // Also include projects assigned to the student's group (if they have one)
                if ($userGroup) {
                    $q->orWhere('assigned_group_id', $userGroup->id);
                }
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
            'data' => new ProjectResource($project->load(['supervisor', 'students', 'assignedGroup.leader', 'assignedGroup.members'])),
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

        // CRITICAL: Only group leader can register
        if ($studentGroup->leader_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Only group leaders can register for projects',
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

    /**
     * Get student's group registration request
     * Returns the current registration request for the student's group
     */
    public function getGroupRegistrationRequest(Request $request): JsonResponse
    {
        $student = $request->user();
        
        // Find student's active group
        $studentGroup = \App\Models\StudentGroup::where(function ($query) use ($student) {
            $query->where('leader_id', $student->id)
                ->orWhereHas('members', function ($q) use ($student) {
                    $q->where('users.id', $student->id);
                });
        })
            ->where('status', 'active')
            ->first();

        if (!$studentGroup) {
            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'No active group found',
            ]);
        }

        // Get the most recent group registration request
        $groupRequest = \App\Models\GroupRegistrationRequest::where('student_group_id', $studentGroup->id)
            ->with([
                'studentGroup.leader',
                'studentGroup.members',
                'submitter',
                'reviewer',
                'approvedProject.supervisor',
                'projectRegistrations.project.supervisor',
            ])
            ->orderBy('submitted_at', 'desc')
            ->first();

        if (!$groupRequest) {
            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'No registration request found',
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => new \App\Http\Resources\GroupRegistrationRequestResource($groupRequest),
        ]);
    }

    /**
     * Batch register group for multiple projects
     */
    public function batchRegister(Request $request): JsonResponse
    {
        $user = $request->user();

        // Check authorization
        if (!$user->isStudent()) {
            return response()->json([
                'success' => false,
                'message' => 'Only students can register for projects',
            ], 403);
        }

        $validated = $request->validate([
            'project_ids' => 'required|array|min:1',
            'project_ids.*' => 'required|exists:projects,id',
            'student_group_id' => 'required|exists:student_groups,id',
        ]);

        $studentGroup = \App\Models\StudentGroup::findOrFail($validated['student_group_id']);

        // CRITICAL: Only group leader can register
        if ($studentGroup->leader_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Only group leaders can register for projects',
            ], 403);
        }

        try {
            $request = $this->projectService->registerGroupBatch(
                $validated['project_ids'],
                $studentGroup,
                $user
            );

            return response()->json([
                'success' => true,
                'data' => new \App\Http\Resources\GroupRegistrationRequestResource($request),
                'message' => 'Registration request submitted successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function cancelRegistration(Request $request, ProjectRegistration $registration): JsonResponse
    {
        $user = $request->user();

        // Only support group registration cancellation
        if (!$registration->group_registration_request_id) {
            return response()->json([
                'success' => false,
                'message' => 'Individual registrations are not supported. All registrations must be part of a group request.',
            ], 400);
        }

        $groupRequest = $registration->groupRegistrationRequest;
        
        // Only group leader can cancel
        if ($groupRequest->submitted_by !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Only group leaders can cancel registration requests',
            ], 403);
        }
        
        // Only allow cancellation if request is pending
        if (!$groupRequest->isPending()) {
            return response()->json([
                'success' => false,
                'message' => 'Only pending registration requests can be cancelled',
            ], 403);
        }
        
        try {
            // Cancel the entire request (all registrations)
            $groupRequest->update(['status' => 'cancelled']);
            $groupRequest->projectRegistrations()->update(['status' => 'cancelled']);
            
            return response()->json([
                'success' => true,
                'message' => 'Registration request cancelled successfully',
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

