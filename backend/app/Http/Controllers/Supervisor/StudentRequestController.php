<?php

namespace App\Http\Controllers\Supervisor;

use App\Http\Controllers\Controller;
use App\Http\Resources\RequestResource;
use App\Models\ProjectRequest;
use App\Services\RequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentRequestController extends Controller
{
    public function __construct(
        protected RequestService $requestService
    ) {}

    /**
     * List student change_supervisor requests for projects supervised by the current user (pending only).
     */
    public function index(Request $request): JsonResponse
    {
        $supervisor = $request->user();
        $query = ProjectRequest::where('type', 'change_supervisor')
            ->where('status', 'pending')
            ->whereHas('project', fn ($q) => $q->where('supervisor_id', $supervisor->id))
            ->with(['student', 'project']);

        $query = $query->orderByDesc('created_at');
        $items = $query->get();

        return response()->json([
            'success' => true,
            'data' => RequestResource::collection($items),
            'pagination' => [
                'total' => $items->count(),
                'page' => 1,
                'pageSize' => $items->count() ?: 10,
                'totalPages' => 1,
            ],
        ]);
    }

    /**
     * Approve a change_supervisor request (forwards to committee).
     */
    public function approve(Request $request, ProjectRequest $projectRequest): JsonResponse
    {
        if ($projectRequest->project->supervisor_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to approve this request',
            ], 403);
        }

        try {
            $approved = $this->requestService->approveBySupervisor(
                $projectRequest,
                $request->user(),
                $request->input('comments')
            );

            return response()->json([
                'success' => true,
                'data' => new RequestResource($approved->load(['student', 'project'])),
                'message' => 'Request approved and forwarded to the Projects Committee',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Reject a change_supervisor request.
     */
    public function reject(Request $request, ProjectRequest $projectRequest): JsonResponse
    {
        if ($projectRequest->project->supervisor_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to reject this request',
            ], 403);
        }

        try {
            $rejected = $this->requestService->rejectBySupervisor(
                $projectRequest,
                $request->user(),
                $request->input('comments')
            );

            return response()->json([
                'success' => true,
                'data' => new RequestResource($rejected->load(['student', 'project'])),
                'message' => 'Request rejected',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}
