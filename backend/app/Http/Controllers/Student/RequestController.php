<?php

namespace App\Http\Controllers\Student;

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
        $query = ProjectRequest::where('student_id', $request->user()->id)
            ->with(['student', 'project']);

        $query = $this->applyTableQuery($query, $request);

        return response()->json($this->getPaginatedResponse($query, $request));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:change_supervisor,change_group,change_project,other',
            'project_id' => 'nullable|exists:projects,id',
            'reason' => 'required|string',
            'additional_data' => 'nullable|array',
        ]);

        try {
            $projectRequest = $this->requestService->create($validated, $request->user());

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

