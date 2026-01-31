<?php

namespace App\Http\Controllers\ProjectsCommittee;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Http\Resources\SupervisorAssignmentRequestResource;
use App\Http\Resources\UserResource;
use App\Http\Traits\HasTableQuery;
use App\Models\Project;
use App\Models\SupervisorAssignmentRequest;
use App\Models\User;
use App\Services\NotificationService;
use App\Services\ProjectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupervisorController extends Controller
{
    use HasTableQuery;

    public function __construct(
        protected ProjectService $projectService,
        protected NotificationService $notificationService
    ) {}

    /**
     * List all active supervisors with their project counts
     */
    public function index(Request $request): JsonResponse
    {
        $supervisors = User::where('role', 'supervisor')
            ->where('status', 'active')
            ->withCount(['supervisedProjects'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => UserResource::collection($supervisors),
        ]);
    }

    /**
     * Request supervisor assignment for a project
     * Creates a pending request that requires supervisor approval
     */
    public function requestAssignment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'supervisor_id' => 'required|exists:users,id',
            'committee_notes' => 'nullable|string',
        ]);

        try {
            $project = Project::findOrFail($validated['project_id']);
            $supervisor = User::findOrFail($validated['supervisor_id']);

            if (!$supervisor->isSupervisor()) {
                return response()->json([
                    'success' => false,
                    'message' => 'User is not a supervisor',
                    'error_key' => 'committee.supervisors.errorNotSupervisor',
                ], 400);
            }

            // Single-supervisor constraint: block if project already has a supervisor
            if ($project->supervisor_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Project already has a supervisor assigned',
                    'error_key' => 'committee.supervisors.errorAlreadyHasSupervisor',
                ], 400);
            }

            // Check if there's already a pending request for this project
            $existingRequest = SupervisorAssignmentRequest::where('project_id', $project->id)
                ->where('status', 'pending')
                ->first();

            if ($existingRequest) {
                return response()->json([
                    'success' => false,
                    'message' => 'There is already a pending assignment request for this project',
                    'error_key' => 'committee.supervisors.errorPendingRequestExists',
                ], 400);
            }

            // Create the assignment request
            $assignmentRequest = SupervisorAssignmentRequest::create([
                'project_id' => $project->id,
                'supervisor_id' => $supervisor->id,
                'requested_by' => $request->user()->id,
                'committee_notes' => $validated['committee_notes'] ?? null,
                'status' => 'pending',
            ]);

            // Notify the supervisor
            $this->notificationService->create(
                $supervisor,
                "تم ترشيحك للإشراف على المشروع: {$project->title}. يرجى الموافقة أو الرفض.",
                'supervisor_assignment_request',
                'supervisor_assignment_request',
                $assignmentRequest->id
            );

            return response()->json([
                'success' => true,
                'data' => new SupervisorAssignmentRequestResource($assignmentRequest->load(['project', 'supervisor', 'requestedBy'])),
                'message' => 'Supervisor assignment request sent successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Direct assign (without approval requirement)
     * Used for emergency cases or when supervisor has already verbally agreed
     */
    public function assign(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'supervisor_id' => 'required|exists:users,id',
        ]);

        try {
            $project = Project::findOrFail($validated['project_id']);
            $supervisor = User::findOrFail($validated['supervisor_id']);

            if (!$supervisor->isSupervisor()) {
                return response()->json([
                    'success' => false,
                    'message' => 'User is not a supervisor',
                    'error_key' => 'committee.supervisors.errorNotSupervisor',
                ], 400);
            }

            // Single-supervisor constraint: block if project already has a supervisor
            if ($project->supervisor_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Project already has a supervisor assigned',
                    'error_key' => 'committee.supervisors.errorAlreadyHasSupervisor',
                ], 400);
            }

            // Direct assignment - no approval required
            $updated = $this->projectService->assignSupervisor($project, $supervisor, false);

            // Notify the supervisor
            $this->notificationService->create(
                $supervisor,
                "تم تعيينك مشرفاً على المشروع: {$project->title}",
                'supervisor_assigned',
                'project',
                $project->id
            );

            return response()->json([
                'success' => true,
                'data' => new ProjectResource($updated->load(['supervisor'])),
                'message' => 'Supervisor assigned successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Unassign supervisor from project (committee remove).
     * After unassign, project has no supervisor and committee can assign another.
     */
    public function unassign(Request $request, Project $project): JsonResponse
    {
        try {
            $updated = $this->projectService->removeSupervisor($project);

            return response()->json([
                'success' => true,
                'data' => new ProjectResource($updated->load(['supervisor'])),
                'message' => 'Supervisor removed successfully',
            ]);
        } catch (\Exception $e) {
            $code = $e->getMessage() === 'Project has no supervisor assigned' ? 400 : 400;

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error_key' => $e->getMessage() === 'Project has no supervisor assigned'
                    ? 'committee.supervisors.errorNoSupervisorToRemove'
                    : null,
            ], $code);
        }
    }

    /**
     * List assignment requests
     */
    public function listRequests(Request $request): JsonResponse
    {
        $query = SupervisorAssignmentRequest::with(['project', 'supervisor', 'requestedBy', 'respondedBy']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $query = $this->applyTableQuery($query, $request);

        return response()->json($this->getPaginatedResponse($query, $request, SupervisorAssignmentRequestResource::class));
    }

    /**
     * Show a specific assignment request
     */
    public function showRequest(SupervisorAssignmentRequest $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new SupervisorAssignmentRequestResource($request->load(['project', 'supervisor', 'requestedBy', 'respondedBy'])),
        ]);
    }

    /**
     * Cancel a pending assignment request
     */
    public function cancelRequest(Request $request, SupervisorAssignmentRequest $assignmentRequest): JsonResponse
    {
        if (!$assignmentRequest->isPending()) {
            return response()->json([
                'success' => false,
                'message' => 'Can only cancel pending requests',
            ], 400);
        }

        try {
            // Notify the supervisor about cancellation
            $this->notificationService->create(
                $assignmentRequest->supervisor,
                "تم إلغاء طلب الإشراف على المشروع: {$assignmentRequest->project->title}",
                'supervisor_assignment_cancelled',
                'project',
                $assignmentRequest->project_id
            );

            $assignmentRequest->delete();

            return response()->json([
                'success' => true,
                'message' => 'Assignment request cancelled successfully',
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
            $q->whereHas('supervisor', function ($supervisorQuery) use ($search) {
                $supervisorQuery->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->orWhereHas('project', function ($projectQuery) use ($search) {
                $projectQuery->where('title', 'like', "%{$search}%");
            });
        });
    }

    protected function applyFilters($query, array $filters)
    {
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        return $query;
    }

    /**
     * List projects for supervisor assignment with status filter.
     * Returns projects with assignment_status: needs_supervisor | pending_approval | approved | rejected.
     */
    public function listForAssignment(Request $request): JsonResponse
    {
        $this->authorize('viewAny', SupervisorAssignmentRequest::class);

        $statusFilter = $request->get('status', 'all');
        $page = (int) $request->get('page', 1);
        $pageSize = (int) $request->get('pageSize', 10);
        $search = $request->get('search');

        // Scope: projects in workflow statuses relevant for supervisor assignment
        $baseQuery = Project::query()
            ->whereIn('status', [
                \App\Enums\ProjectStatus::DRAFT->value,
                \App\Enums\ProjectStatus::AVAILABLE_FOR_REGISTRATION->value,
                \App\Enums\ProjectStatus::IN_PROGRESS->value,
            ])
            ->with(['supervisor', 'assignedGroup.leader'])
            ->with(['supervisorAssignmentRequests' => fn ($q) => $q->latest()->limit(1)]);

        // Filter by assignment status
        if ($statusFilter !== 'all') {
            switch ($statusFilter) {
                case 'needs_supervisor':
                    $baseQuery->whereNull('supervisor_id')
                        ->whereDoesntHave('supervisorAssignmentRequests', fn ($q) => $q->where('status', 'pending'));
                    break;
                case 'pending_approval':
                    $baseQuery->whereHas('supervisorAssignmentRequests', fn ($q) => $q->where('status', 'pending'));
                    break;
                case 'approved':
                    $baseQuery->whereNotNull('supervisor_id');
                    break;
                case 'rejected':
                    $baseQuery->whereNull('supervisor_id')
                        ->whereHas('supervisorAssignmentRequests', fn ($q) => $q->where('status', 'rejected'))
                        ->whereDoesntHave('supervisorAssignmentRequests', fn ($q) => $q->where('status', 'pending'));
                    break;
            }
        }

        if ($search) {
            $baseQuery->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('supervisor', fn ($sq) => $sq->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
            });
        }

        $baseQuery->orderBy('updated_at', 'desc');

        $total = $baseQuery->count();
        $projects = $baseQuery->skip(($page - 1) * $pageSize)->take($pageSize)->get();

        $rows = $projects->map(function (Project $project) {
            $latestRequest = $project->supervisorAssignmentRequests->first();
            $assignmentStatus = $project->supervisor_id
                ? 'approved'
                : ($latestRequest
                    ? $latestRequest->status === 'pending'
                        ? 'pending_approval'
                        : ($latestRequest->status === 'rejected' ? 'rejected' : 'needs_supervisor')
                    : 'needs_supervisor');

            return [
                'project' => new ProjectResource($project->load('supervisor')),
                'assignmentStatus' => $assignmentStatus,
                'latestRequest' => $latestRequest ? new SupervisorAssignmentRequestResource($latestRequest->load(['supervisor', 'requestedBy', 'respondedBy'])) : null,
            ];
        })->values()->all();

        $totalPages = (int) ceil($total / $pageSize);

        return response()->json([
            'success' => true,
            'data' => $rows,
            'pagination' => [
                'page' => $page,
                'pageSize' => $pageSize,
                'total' => $total,
                'totalPages' => $totalPages,
            ],
        ]);
    }
}

