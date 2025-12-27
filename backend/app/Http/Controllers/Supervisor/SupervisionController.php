<?php

namespace App\Http\Controllers\Supervisor;

use App\Http\Controllers\Controller;
use App\Http\Resources\RequestResource;
use App\Http\Traits\HasTableQuery;
use App\Models\ProjectRequest;
use App\Services\RequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupervisionController extends Controller
{
    use HasTableQuery;

    public function __construct(
        protected RequestService $requestService
    ) {}

    public function index(Request $request): JsonResponse
    {
        // Get requests for projects supervised by this supervisor
        $query = ProjectRequest::whereHas('project', function ($q) use ($request) {
            $q->where('supervisor_id', $request->user()->id);
        })
        ->where('status', 'pending')
        ->with(['student', 'project']);

        $query = $this->applyTableQuery($query, $request);

        return response()->json($this->getPaginatedResponse($query, $request));
    }

    public function approve(Request $request, ProjectRequest $projectRequest): JsonResponse
    {
        try {
            $approved = $this->requestService->approveBySupervisor(
                $projectRequest,
                $request->user(),
                $request->input('comments')
            );

            return response()->json([
                'success' => true,
                'data' => new RequestResource($approved->load(['student', 'project'])),
                'message' => 'Request approved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function reject(Request $request, ProjectRequest $projectRequest): JsonResponse
    {
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

