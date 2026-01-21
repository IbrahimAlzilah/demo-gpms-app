<?php

namespace App\Http\Controllers\Supervisor;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Http\Traits\HasTableQuery;
use App\Models\Project;
use App\Services\ProjectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupervisionController extends Controller
{
    use HasTableQuery;

    public function __construct(
        protected ProjectService $projectService
    ) {}

    public function index(Request $request): JsonResponse
    {
        // Get projects assigned to this supervisor
        $query = Project::where('supervisor_id', $request->user()->id)
            ->with(['supervisor', 'students']);

        // Apply status filter if provided
        $filters = $request->get('filters', []);
        $statusFilter = $filters['supervisorApprovalStatus'] ?? null;

        // Remove status filter from filters array to avoid double application in applyTableQuery
        if (isset($filters['supervisorApprovalStatus'])) {
            unset($filters['supervisorApprovalStatus']);
            $request->merge(['filters' => $filters]);
        }

        // Apply status filter only if a specific status is selected (not 'all' and not null)
        if ($statusFilter && $statusFilter !== 'all') {
            $query->where('supervisor_approval_status', $statusFilter);
        }
        // If statusFilter is 'all' or null (default), show all statuses - don't apply any status filter

        $query = $this->applyTableQuery($query, $request);

        return response()->json($this->getPaginatedResponse($query, $request, ProjectResource::class));
    }

    public function approve(Request $request, Project $project): JsonResponse
    {
        try {
            $approved = $this->projectService->approveSupervisorAssignment(
                $project,
                $request->user(),
                $request->input('comments')
            );

            return response()->json([
                'success' => true,
                'data' => new ProjectResource($approved->load(['supervisor', 'students'])),
                'message' => 'Project assignment approved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function reject(Request $request, Project $project): JsonResponse
    {
        try {
            $rejected = $this->projectService->rejectSupervisorAssignment(
                $project,
                $request->user(),
                $request->input('comments')
            );

            return response()->json([
                'success' => true,
                'data' => new ProjectResource($rejected->load(['supervisor', 'students'])),
                'message' => 'Project assignment rejected',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get list of pending supervisor assignment requests
     */
    public function listAssignmentRequests(Request $request): JsonResponse
    {
        $supervisor = $request->user();

        $requests = \App\Models\SupervisorAssignmentRequest::where('supervisor_id', $supervisor->id)
            ->where('status', 'pending')
            ->with(['project', 'requestedBy'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => \App\Http\Resources\SupervisorAssignmentRequestResource::collection($requests),
        ]);
    }

    /**
     * Approve a supervisor assignment request
     */
    public function approveAssignmentRequest(Request $request, \App\Models\SupervisorAssignmentRequest $assignmentRequest): JsonResponse
    {
        $supervisor = $request->user();

        if ($assignmentRequest->supervisor_id !== $supervisor->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        if (!$assignmentRequest->isPending()) {
            return response()->json([
                'success' => false,
                'message' => 'Request has already been processed',
            ], 400);
        }

        $validated = $request->validate([
            'response' => 'nullable|string|max:1000',
        ]);

        try {
            // Update the request status
            $assignmentRequest->update([
                'status' => 'approved',
                'responded_by' => $supervisor->id,
                'supervisor_response' => $validated['response'] ?? 'Approved',
                'responded_at' => now(),
            ]);

            // Assign the supervisor to the project AND mark approval as approved immediately
            // (since the supervisor is approving right now)
            $project = $assignmentRequest->project;
            $project->update([
                'supervisor_id' => $supervisor->id,
                'supervisor_approval_status' => 'approved',
                'supervisor_approval_comments' => $validated['response'] ?? null,
                'supervisor_approval_at' => now(),
            ]);

            // Notify projects committee
            $requester = $assignmentRequest->requestedBy;
            $notificationService = app(\App\Services\NotificationService::class);
            $notificationService->create(
                $requester,
                "قبل المشرف {$supervisor->name} الإشراف على المشروع: {$project->title}",
                'supervisor_assignment_approved',
                'project',
                $project->id
            );

            return response()->json([
                'success' => true,
                'data' => new \App\Http\Resources\SupervisorAssignmentRequestResource($assignmentRequest->fresh()->load(['project', 'supervisor', 'requestedBy', 'respondedBy'])),
                'message' => 'Assignment request approved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Reject a supervisor assignment request
     */
    public function rejectAssignmentRequest(Request $request, \App\Models\SupervisorAssignmentRequest $assignmentRequest): JsonResponse
    {
        $supervisor = $request->user();

        if ($assignmentRequest->supervisor_id !== $supervisor->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        if (!$assignmentRequest->isPending()) {
            return response()->json([
                'success' => false,
                'message' => 'Request has already been processed',
            ], 400);
        }

        $validated = $request->validate([
            'response' => 'required|string|max:1000',
        ]);

        try {
            // Update the request status
            $assignmentRequest->update([
                'status' => 'rejected',
                'responded_by' => $supervisor->id,
                'supervisor_response' => $validated['response'],
                'responded_at' => now(),
            ]);

            // Notify projects committee
            $requester = $assignmentRequest->requestedBy;
            $notificationService = app(\App\Services\NotificationService::class);
            $notificationService->create(
                $requester,
                "رفض المشرف {$supervisor->name} الإشراف على المشروع: {$assignmentRequest->project->title}\nالسبب: {$validated['response']}",
                'supervisor_assignment_rejected',
                'project',
                $assignmentRequest->project_id
            );

            return response()->json([
                'success' => true,
                'data' => new \App\Http\Resources\SupervisorAssignmentRequestResource($assignmentRequest->fresh()->load(['project', 'supervisor', 'requestedBy', 'respondedBy'])),
                'message' => 'Assignment request rejected',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}

