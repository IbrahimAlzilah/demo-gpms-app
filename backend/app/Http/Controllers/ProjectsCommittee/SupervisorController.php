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
                ], 400);
            }

            // Check if project already has a supervisor
            if ($project->supervisor_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Project already has a supervisor assigned',
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
                ], 400);
            }

            // Check if project already has a supervisor
            if ($project->supervisor_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Project already has a supervisor assigned',
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
}

