<?php

namespace App\Http\Controllers\ProjectsCommittee;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProposalResource;
use App\Http\Traits\HasTableQuery;
use App\Models\Proposal;
use App\Services\ProposalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProposalController extends Controller
{
    use HasTableQuery;

    public function __construct(
        protected ProposalService $proposalService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Proposal::with(['submitter', 'reviewer', 'project']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $query = $this->applyTableQuery($query, $request);

        return response()->json($this->getPaginatedResponse($query, $request));
    }

    public function show(Proposal $proposal): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new ProposalResource($proposal->load(['submitter', 'reviewer', 'project'])),
        ]);
    }

    public function approve(Request $request, Proposal $proposal): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => 'nullable|exists:projects,id',
        ]);

        try {
            $approved = $this->proposalService->approve(
                $proposal,
                $request->user(),
                $validated['project_id'] ?? null
            );

            return response()->json([
                'success' => true,
                'data' => new ProposalResource($approved->load(['submitter', 'reviewer'])),
                'message' => 'Proposal approved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function reject(Request $request, Proposal $proposal): JsonResponse
    {
        $validated = $request->validate([
            'review_notes' => 'nullable|string',
        ]);

        try {
            $rejected = $this->proposalService->reject(
                $proposal,
                $request->user(),
                $validated['review_notes'] ?? null
            );

            return response()->json([
                'success' => true,
                'data' => new ProposalResource($rejected->load(['submitter', 'reviewer'])),
                'message' => 'Proposal rejected',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function requestModification(Request $request, Proposal $proposal): JsonResponse
    {
        $validated = $request->validate([
            'review_notes' => 'required|string',
        ]);

        try {
            $updated = $this->proposalService->requestModification(
                $proposal,
                $request->user(),
                $validated['review_notes']
            );

            return response()->json([
                'success' => true,
                'data' => new ProposalResource($updated->load(['submitter', 'reviewer'])),
                'message' => 'Modification requested',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}

