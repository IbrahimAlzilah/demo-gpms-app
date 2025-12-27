<?php

namespace App\Http\Controllers\ProjectsCommittee;

use App\Http\Controllers\Controller;
use App\Http\Resources\RequestResource;
use App\Http\Traits\HasTableQuery;
use App\Models\ProjectRequest;
use App\Services\RequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RequestController extends Controller
{
    use HasTableQuery;

    public function __construct(
        protected RequestService $requestService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = ProjectRequest::where('status', 'supervisor_approved')
            ->with(['student', 'project']);

        $query = $this->applyTableQuery($query, $request);

        return response()->json($this->getPaginatedResponse($query, $request));
    }

    public function show(ProjectRequest $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new RequestResource($request->load(['student', 'project'])),
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

    protected function applySearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('reason', 'like', "%{$search}%")
                ->orWhereHas('student', function ($studentQuery) use ($search) {
                    $studentQuery->where('name', 'like', "%{$search}%")
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
        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }
        return $query;
    }
}

