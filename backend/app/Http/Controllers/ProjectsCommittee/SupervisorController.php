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
     * Creates a pending request that requires supervisor approval.
     * If project already has a supervisor or a pending request, cancels the previous one(s) first.
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

            // If project has a supervisor (change flow): cancel their request(s) and unassign
            if ($project->supervisor_id) {
                $this->cancelAssignmentRequestsForProject($project->id, $project->supervisor_id, $project->title);
                $this->projectService->removeSupervisor($project);
                $project->refresh();
            } else {
                // Cancel any existing pending (or other) request for this project
                $existing = SupervisorAssignmentRequest::where('project_id', $project->id)
                    ->whereIn('status', ['pending', 'approved'])
                    ->get();
                foreach ($existing as $req) {
                    $req->update(['status' => 'canceled']);
                    $this->notificationService->create(
                        $req->supervisor,
                        "تم إلغاء طلب الإشراف على المشروع: {$project->title} من قبل اللجنة.",
                        'supervisor_assignment_cancelled',
                        'project',
                        $project->id
                    );
                }
            }

            // Create the new assignment request
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
     * Used for emergency cases or when supervisor has already verbally agreed.
     * If project already has a different supervisor, cancels their request(s) and replaces.
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

            // If project has a different supervisor: cancel their request(s) and unassign first
            if ($project->supervisor_id && (int) $project->supervisor_id !== (int) $supervisor->id) {
                $this->cancelAssignmentRequestsForProject($project->id, $project->supervisor_id, $project->title);
                $this->projectService->removeSupervisor($project);
                $project->refresh();
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
     * Marks the previous supervisor's assignment request(s) as canceled so they see it on their requests page.
     */
    public function unassign(Request $request, Project $project): JsonResponse
    {
        try {
            $previousSupervisorId = $project->supervisor_id;
            if ($previousSupervisorId) {
                $this->cancelAssignmentRequestsForProject($project->id, $previousSupervisorId, $project->title);
            }
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
     * Mark assignment request(s) for a project + supervisor as canceled and notify the supervisor.
     */
    private function cancelAssignmentRequestsForProject(int $projectId, int $supervisorId, string $projectTitle): void
    {
        $requests = SupervisorAssignmentRequest::where('project_id', $projectId)
            ->where('supervisor_id', $supervisorId)
            ->whereIn('status', ['pending', 'approved'])
            ->get();

        $supervisor = User::find($supervisorId);
        foreach ($requests as $req) {
            $req->update(['status' => 'canceled']);
            if ($supervisor) {
                $this->notificationService->create(
                    $supervisor,
                    "تم إلغاء الإشراف على المشروع: {$projectTitle} من قبل اللجنة.",
                    'supervisor_assignment_cancelled',
                    'project',
                    $projectId
                );
            }
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
     * Cancel a pending assignment request (mark as canceled so supervisor sees it on their page).
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
            $assignmentRequest->update(['status' => 'canceled']);

            // Notify the supervisor about cancellation
            $this->notificationService->create(
                $assignmentRequest->supervisor,
                "تم إلغاء طلب الإشراف على المشروع: {$assignmentRequest->project->title}",
                'supervisor_assignment_cancelled',
                'project',
                $assignmentRequest->project_id
            );

            return response()->json([
                'success' => true,
                'data' => new SupervisorAssignmentRequestResource($assignmentRequest->fresh()->load(['project', 'supervisor', 'requestedBy', 'respondedBy'])),
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
            ->with(['supervisorAssignmentRequests' => fn ($q) => $q->orderBy('updated_at', 'desc')->limit(1)]);

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

