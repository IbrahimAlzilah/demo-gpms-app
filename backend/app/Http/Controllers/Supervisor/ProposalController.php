<?php

namespace App\Http\Controllers\Supervisor;

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

        // Get filters from request
        $filters = $request->get('filters', []);

        // For "My Proposals" route: filter by submitter_id (user's proposals)
        // For "Approved Proposals" route: show all approved proposals (no submitter filter)
        if (isset($filters['submitterId'])) {
            // Explicitly filter by submitterId (for "My Proposals")
            $query->where('submitter_id', $filters['submitterId']);
        } elseif (isset($filters['status']) && $filters['status'] === 'approved') {
            // For "Approved Proposals": show all approved proposals (no submitter filter)
            // Don't apply submitter filter
        } else {
            // Default behavior: show only user's proposals
            $query->where('submitter_id', $request->user()->id);
        }

        $query = $this->applyTableQuery($query, $request);

        return response()->json($this->getPaginatedResponse($query, $request, ProposalResource::class));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'objectives' => 'required|string',
            'methodology' => 'nullable|string',
            'expected_outcomes' => 'nullable|string',
        ]);

        $proposal = $this->proposalService->create($validated, $request->user());

        return response()->json([
            'success' => true,
            'data' => new ProposalResource($proposal->load(['submitter'])),
            'message' => 'Proposal created successfully',
        ], 201);
    }

    public function show(Proposal $proposal): JsonResponse
    {
        $this->authorize('view', $proposal);

        return response()->json([
            'success' => true,
            'data' => new ProposalResource($proposal->load(['submitter', 'reviewer', 'project'])),
        ]);
    }

    public function update(Request $request, Proposal $proposal): JsonResponse
    {
        $this->authorize('update', $proposal);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'objectives' => 'sometimes|string',
            'methodology' => 'nullable|string',
            'expected_outcomes' => 'nullable|string',
        ]);

        // If proposal requires modification, allow resubmission by changing status to pending_review
        if ($proposal->status === 'requires_modification') {
            $validated['status'] = 'pending_review';
        }

        $proposal->update($validated);

        return response()->json([
            'success' => true,
            'data' => new ProposalResource($proposal->fresh()->load(['submitter', 'reviewer'])),
            'message' => 'Proposal updated successfully',
        ]);
    }

    protected function applySearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
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
