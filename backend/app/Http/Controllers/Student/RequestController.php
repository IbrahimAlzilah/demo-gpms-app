<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Http\Resources\RequestResource;
use App\Http\Resources\StudentGroupResource;
use App\Http\Resources\UserResource;
use App\Http\Traits\HasTableQuery;
use App\Enums\TimePeriodType;
use App\Models\Project;
use App\Models\ProjectRequest;
use App\Models\StudentGroup;
use App\Models\User;
use App\Services\RequestService;
use App\Services\TimeWindowService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RequestController extends Controller
{
    use HasTableQuery;

    public function __construct(
        protected RequestService $requestService
    ) {}

    /**
     * Request types that only the group leader can submit.
     */
    private const LEADER_ONLY_REQUEST_TYPES = ['change_supervisor', 'change_project', 'change_project_title'];

    /**
     * Get context for the request form: current supervisor, group, project; available supervisors, groups, projects.
     */
    public function context(Request $request): JsonResponse
    {
        $user = $request->user();
        $currentGroup = StudentGroup::where(function ($q) use ($user) {
            $q->where('leader_id', $user->id)
                ->orWhereHas('members', fn ($m) => $m->where('users.id', $user->id));
        })->where('status', 'active')->with(['leader', 'members'])->first();

        $currentProject = null;
        $currentSupervisor = null;
        if ($currentGroup) {
            $currentProject = Project::where('assigned_group_id', $currentGroup->id)
                ->with(['supervisor', 'assignedGroup.leader', 'assignedGroup.members'])
                ->first();
            if ($currentProject?->supervisor_id) {
                $currentSupervisor = User::find($currentProject->supervisor_id);
            }
        }

        $isGroupLeader = $currentGroup && (string) $currentGroup->leader_id === (string) $user->id;
        $timeWindowService = app(TimeWindowService::class);
        $requestSubmissionWindowActive = $timeWindowService->isWindowActive(TimePeriodType::REQUEST_SUBMISSION);
        $groupHasApprovedProject = $currentProject !== null;
        $canSubmitLeaderOnlyRequests = $isGroupLeader
            && $requestSubmissionWindowActive
            && $groupHasApprovedProject;

        $availableSupervisors = User::where('role', 'supervisor')->where('status', 'active')->get();
        $availableProjects = Project::where('status', 'available_for_registration')->get();
        $availableGroups = StudentGroup::where('status', 'active')
            ->when($currentGroup, fn ($q) => $q->where('id', '!=', $currentGroup->id))
            ->with(['leader', 'members'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'currentSupervisor' => $currentSupervisor ? new UserResource($currentSupervisor) : null,
                'currentGroup' => $currentGroup ? new StudentGroupResource($currentGroup) : null,
                'currentProject' => $currentProject ? new ProjectResource($currentProject) : null,
                'availableSupervisors' => UserResource::collection($availableSupervisors),
                'availableProjects' => ProjectResource::collection($availableProjects),
                'availableGroups' => StudentGroupResource::collection($availableGroups),
                'isGroupLeader' => $isGroupLeader,
                'requestSubmissionWindowActive' => $requestSubmissionWindowActive,
                'canSubmitLeaderOnlyRequests' => $canSubmitLeaderOnlyRequests,
            ],
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $query = ProjectRequest::where('student_id', $request->user()->id)
            ->with(['student', 'project']);

        $query = $this->applyTableQuery($query, $request);

        return response()->json($this->getPaginatedResponse($query, $request, RequestResource::class));
    }

    public function show(Request $request, ProjectRequest $projectRequest): JsonResponse
    {
        // Check authorization
        if ($projectRequest->student_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to view this request',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => new RequestResource($projectRequest->load(['student', 'project'])),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:change_supervisor,change_group,change_project,change_project_title,other',
            'project_id' => 'nullable|exists:projects,id',
            'reason' => 'required|string',
            'additional_data' => 'nullable|array',
            'additional_data.proposed_supervisor_id' => 'nullable|required_if:type,change_supervisor|exists:users,id',
            'additional_data.target_group_id' => 'nullable|required_if:type,change_group|exists:student_groups,id',
            'additional_data.target_project_id' => 'nullable|required_if:type,change_project|exists:projects,id',
            'additional_data.title' => 'nullable|required_if:type,change_project_title,other|string|max:255',
        ]);

        $user = $request->user();
        $type = $validated['type'];

        $group = StudentGroup::where(function ($q) use ($user) {
            $q->where('leader_id', $user->id)
                ->orWhereHas('members', fn ($m) => $m->where('users.id', $user->id));
        })->where('status', 'active')->first();

        $project = $group ? Project::where('assigned_group_id', $group->id)->first() : null;

        if (in_array($type, self::LEADER_ONLY_REQUEST_TYPES, true)) {
            if (!$group) {
                return response()->json([
                    'success' => false,
                    'message' => 'You must be in a group to submit this type of request. Only the group leader can submit Change Supervisor, Change Project, and Change Project Title requests.',
                ], 403);
            }
            if ((string) $group->leader_id !== (string) $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only the group leader can submit Change Supervisor, Change Project, and Change Project Title requests.',
                ], 403);
            }
            $timeWindowService = app(TimeWindowService::class);
            if (!$timeWindowService->isWindowActive(TimePeriodType::REQUEST_SUBMISSION)) {
                return response()->json([
                    'success' => false,
                    'message' => 'The request submission period is not currently open. Please check the time windows for when you can submit requests.',
                ], 403);
            }
            if (!$project) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your group must be registered in an approved project to submit this type of request.',
                ], 400);
            }
        }

        if ($type === 'change_supervisor') {
            if (!$group) {
                return response()->json([
                    'success' => false,
                    'message' => 'You must be in a group with an assigned project to request a supervisor change.',
                ], 400);
            }
            if (!$project) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your group has no assigned project. Supervisor change is not applicable.',
                ], 400);
            }
            if (!$project->supervisor_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your project has no supervisor assigned. Change Supervisor requests are only available when a supervisor is already assigned.',
                ], 400);
            }
            $validated['project_id'] = $project->id;
            $proposedId = $validated['additional_data']['proposed_supervisor_id'] ?? null;
            if ($proposedId && $proposedId === $project->supervisor_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'The proposed supervisor is the same as the current supervisor.',
                ], 400);
            }
        }

        try {
            $projectRequest = $this->requestService->create($validated, $user);

            return response()->json([
                'success' => true,
                'data' => new RequestResource($projectRequest->load(['student', 'project'])),
                'message' => 'Request submitted successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function update(Request $request, ProjectRequest $projectRequest): JsonResponse
    {
        // Check authorization first
        if ($projectRequest->student_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to update this request',
            ], 403);
        }

        $settingsService = app(\App\Services\SettingsService::class);
        $requestReasonMinLength = $settingsService->getRequestReasonMinLength();

        $validated = $request->validate([
            'type' => 'sometimes|required|in:change_supervisor,change_group,change_project,change_project_title,other',
            'project_id' => 'nullable|exists:projects,id',
            'reason' => "sometimes|required|string|min:{$requestReasonMinLength}",
            'additional_data' => 'nullable|array',
            'additional_data.proposed_supervisor_id' => 'nullable|required_if:type,change_supervisor|exists:users,id',
            'additional_data.target_group_id' => 'nullable|required_if:type,change_group|exists:student_groups,id',
            'additional_data.target_project_id' => 'nullable|required_if:type,change_project|exists:projects,id',
            'additional_data.title' => 'nullable|required_if:type,change_project_title,other|string|max:255',
        ]);

        $type = $validated['type'] ?? $projectRequest->type;
        $user = $request->user();
        $group = StudentGroup::where(function ($q) use ($user) {
            $q->where('leader_id', $user->id)
                ->orWhereHas('members', fn ($m) => $m->where('users.id', $user->id));
        })->where('status', 'active')->first();
        $project = $group ? Project::where('assigned_group_id', $group->id)->first() : null;

        if (in_array($type, self::LEADER_ONLY_REQUEST_TYPES, true)) {
            if (!$group || (string) $group->leader_id !== (string) $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only the group leader can update Change Supervisor, Change Project, and Change Project Title requests.',
                ], 403);
            }
            $timeWindowService = app(TimeWindowService::class);
            if (!$timeWindowService->isWindowActive(TimePeriodType::REQUEST_SUBMISSION)) {
                return response()->json([
                    'success' => false,
                    'message' => 'The request submission period is not currently open. Updates are not allowed.',
                ], 403);
            }
            if (!$project) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your group must be registered in an approved project to update this request.',
                ], 400);
            }
        }

        if ($type === 'change_supervisor' && $project && !$project->supervisor_id) {
            return response()->json([
                'success' => false,
                'message' => 'Your project has no supervisor assigned. Change Supervisor requests are only available when a supervisor is already assigned.',
            ], 400);
        }

        try {
            $updated = $this->requestService->update($projectRequest, $validated, $request->user());

            return response()->json([
                'success' => true,
                'data' => new RequestResource($updated->load(['student', 'project'])),
                'message' => 'Request updated successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function destroy(Request $request, ProjectRequest $projectRequest): JsonResponse
    {
        // Check authorization first
        if ($projectRequest->student_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to delete this request',
            ], 403);
        }

        try {
            $this->requestService->delete($projectRequest, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'Request deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function cancel(Request $request, ProjectRequest $projectRequest): JsonResponse
    {
        if ($projectRequest->student_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to cancel this request',
            ], 403);
        }

        try {
            $cancelled = $this->requestService->cancel($projectRequest, $request->user());

            return response()->json([
                'success' => true,
                'data' => new RequestResource($cancelled->load(['student', 'project'])),
                'message' => 'Request cancelled successfully',
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
        return $query->where('reason', 'like', "%{$search}%");
    }

    protected function applyFilters($query, array $filters)
    {
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }
        return $query;
    }
}

