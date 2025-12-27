<?php

namespace App\Http\Controllers\ProjectsCommittee;

use App\Http\Controllers\Controller;
use App\Http\Resources\RequestResource;
use App\Models\ProjectRequest;
use App\Services\RequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RequestController extends Controller
{
    public function __construct(
        protected RequestService $requestService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $requests = ProjectRequest::where('status', 'supervisor_approved')
            ->with(['student', 'project'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => RequestResource::collection($requests),
        ]);
    }

    public function approve(Request $request, ProjectRequest $projectRequest): JsonResponse
    {
        try {
            $approved = $this->requestService->approveByCommittee(
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
            $rejected = $this->requestService->rejectByCommittee(
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

