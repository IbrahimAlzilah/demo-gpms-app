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
        // Check if proposal submission window is active (supervisors restricted by this window)
        $timeWindowService = app(\App\Services\TimeWindowService::class);
        if (!$timeWindowService->isWindowActive(\App\Enums\TimePeriodType::PROPOSAL_SUBMISSION)) {
            return response()->json([
                'success' => false,
                'message' => 'Proposal submission is only allowed during the proposal submission window',
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
        ]);

        $proposal = $this->proposalService->create($validated, $request->user());

        return response()->json([
            'success' => true,
            'data' => new ProposalResource($proposal->load(['submitter', 'proposedSupervisor'])),
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

    /**
     * Submit multiple proposals in a batch (supervisor only)
     */
    public function batchSubmit(Request $request): JsonResponse
    {
        $user = $request->user();
        $timeWindowService = app(\App\Services\TimeWindowService::class);

        if (!$timeWindowService->isWindowActive(\App\Enums\TimePeriodType::PROPOSAL_SUBMISSION)) {
            return response()->json([
                'success' => false,
                'message' => 'Proposal submission is only allowed during the proposal submission window',
            ], 403);
        }

        // ENFORCE: Check if supervisor is locked from new submissions (after first submission)
        // This is the key rule: Only ONE initial submission is allowed. After that, new submissions are blocked.
        if ($this->proposalService->isSupervisorLocked($user)) {
            return response()->json([
                'success' => false,
                'message' => 'New proposal submissions are not allowed after the first submission. Please use the edit functionality to add new proposals to your existing submission.',
                'code' => 'SUBMISSION_LOCKED',
            ], 403);
        }

        $validated = $request->validate([
            'proposals' => 'required|array|min:1',
            'proposals.*.title' => 'required|string|max:255',
            'proposals.*.description' => 'required|string',
        ]);

        // Supervisors don't have student_group_id, so pass null
        $proposals = $this->proposalService->createBatch($validated['proposals'], $user, null);

        return response()->json([
            'success' => true,
            'data' => ProposalResource::collection(Proposal::whereIn('id', collect($proposals)->pluck('id'))->with(['submitter', 'proposedSupervisor'])->get()),
            'message' => count($proposals) === 1 ? 'Proposal created successfully' : count($proposals) . ' proposals created successfully',
        ], 201);
    }

    public function update(Request $request, Proposal $proposal): JsonResponse
    {
        $this->authorize('update', $proposal);

        // Ensure proposal can be modified (status must be pending_review or requires_modification)
        if (!$proposal->canBeModified()) {
            return response()->json([
                'success' => false,
                'message' => 'Proposal can only be edited when status is pending_review or requires_modification',
            ], 403);
        }

        // Only allow updating title and description in edit mode
        // proposed_supervisor_id and team_members are not editable
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
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

    /**
     * Get submission context for editing (supervisor only)
     * Returns all editable proposals submitted by the supervisor
     */
    public function getSubmissionContext(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Get ALL proposals submitted by the supervisor (to check statuses)
        $allProposals = Proposal::where('submitter_id', $user->id)
            ->whereNull('student_group_id') // Only supervisor proposals
            ->with(['submitter', 'reviewer', 'project'])
            ->orderBy('created_at', 'asc')
            ->get();

        // Check if ANY proposal is approved - if so, editing is not allowed
        $hasApprovedProposal = $allProposals->contains(function ($proposal) {
            return $proposal->status === \App\Enums\ProposalStatus::APPROVED;
        });

        if ($hasApprovedProposal) {
            return response()->json([
                'success' => false,
                'message' => 'Editing is not allowed. One or more proposals have already been approved by the Project Committee.',
                'can_edit' => false,
                'has_approved_proposal' => true,
            ], 403);
        }

        // Check if ALL proposals are in pending_review status
        // Only allow editing if ALL proposals are pending_review (or requires_modification)
        $allPendingReview = $allProposals->every(function ($proposal) {
            return in_array($proposal->status, [
                \App\Enums\ProposalStatus::PENDING_REVIEW,
                \App\Enums\ProposalStatus::REQUIRES_MODIFICATION
            ]);
        });

        if (!$allPendingReview) {
            return response()->json([
                'success' => false,
                'message' => 'Editing is only allowed when all proposals are in pending review or requires modification status.',
                'can_edit' => false,
                'has_approved_proposal' => false,
            ], 403);
        }

        // Get only editable proposals for this supervisor
        // Only proposals with status 'pending_review' or 'requires_modification' can be edited
        $proposals = $allProposals->filter(function ($proposal) {
            return in_array($proposal->status, [
                \App\Enums\ProposalStatus::PENDING_REVIEW,
                \App\Enums\ProposalStatus::REQUIRES_MODIFICATION
            ]);
        });
        
        return response()->json([
            'success' => true,
            'data' => [
                'group' => null, // Supervisors don't have groups
                'proposals' => ProposalResource::collection($proposals),
                'can_edit' => true,
            ],
        ]);
    }

    /**
     * Update multiple proposals and optionally add new ones (supervisor only)
     */
    public function batchUpdate(Request $request): JsonResponse
    {
        $user = $request->user();
        $timeWindowService = app(\App\Services\TimeWindowService::class);
        
        // Check which window is active
        $isProposalSubmissionWindow = $timeWindowService->isWindowActive(\App\Enums\TimePeriodType::PROPOSAL_SUBMISSION);
        
        // Supervisors can update proposals during active window OR when proposal requires modification
        $canUpdate = $isProposalSubmissionWindow;
        
        if (!$canUpdate) {
            // Check if any proposal requires modification (allows editing even outside windows)
            $proposalIds = $request->input('updates', []);
            $hasModificationRequired = false;
            if (!empty($proposalIds)) {
                $ids = array_column($proposalIds, 'id');
                $hasModificationRequired = Proposal::whereIn('id', $ids)
                    ->where('submitter_id', $user->id)
                    ->where('status', 'requires_modification')
                    ->exists();
            }
            
            if (!$hasModificationRequired) {
                return response()->json([
                    'success' => false,
                    'message' => 'Proposal updates are only allowed during proposal submission window, or when revisions are requested.',
                ], 403);
            }
        }
        
        $validated = $request->validate([
            'updates' => 'required|array',
            'updates.*.id' => 'required|exists:proposals,id',
            'updates.*.title' => 'required|string|max:255',
            'updates.*.description' => 'required|string',
            'new_proposals' => 'nullable|array',
            'new_proposals.*.title' => 'required|string|max:255',
            'new_proposals.*.description' => 'required|string',
        ]);

        // CRITICAL: Check if ALL proposals in the supervisor's submission are in pending_review status
        // If ANY proposal is approved, editing is not allowed
        $allSupervisorProposals = Proposal::where('submitter_id', $user->id)
            ->whereNull('student_group_id') // Only supervisor proposals
            ->get();

        $hasApprovedProposal = $allSupervisorProposals->contains(function ($proposal) {
            return $proposal->status === \App\Enums\ProposalStatus::APPROVED;
        });

        if ($hasApprovedProposal) {
            return response()->json([
                'success' => false,
                'message' => 'Editing is not allowed. One or more proposals have already been approved by the Project Committee.',
            ], 403);
        }

        // Check if ALL proposals are in pending_review or requires_modification status
        $allPendingReview = $allSupervisorProposals->every(function ($proposal) {
            return in_array($proposal->status, [
                \App\Enums\ProposalStatus::PENDING_REVIEW,
                \App\Enums\ProposalStatus::REQUIRES_MODIFICATION
            ]);
        });

        if (!$allPendingReview) {
            return response()->json([
                'success' => false,
                'message' => 'Editing is only allowed when all proposals are in pending review or requires modification status.',
            ], 403);
        }
        
        // Validate updates - check authorization and ownership for each proposal
        foreach ($validated['updates'] as $updateData) {
            $proposal = Proposal::findOrFail($updateData['id']);
            
            // Check if user can update this proposal
            if ($proposal->submitter_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => "You are not authorized to update proposal #{$proposal->id}",
                ], 403);
            }

            // Ensure proposal belongs to the supervisor (student_group_id must be null)
            if ($proposal->student_group_id !== null) {
                return response()->json([
                    'success' => false,
                    'message' => "Proposal #{$proposal->id} does not belong to your submission.",
                ], 403);
            }

            // Ensure proposal was submitted by the supervisor
            if ($proposal->submitter_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => "You can only update proposals you submitted.",
                ], 403);
            }
            
            // Ensure proposal is in editable status
            if (!in_array($proposal->status, [
                \App\Enums\ProposalStatus::PENDING_REVIEW,
                \App\Enums\ProposalStatus::REQUIRES_MODIFICATION
            ])) {
                return response()->json([
                    'success' => false,
                    'message' => "Proposal #{$proposal->id} cannot be edited. Only proposals in pending review or requiring modification can be edited.",
                ], 403);
            }
        }
        
        // Perform batch update
        $result = $this->proposalService->updateBatch(
            $validated['updates'],
            $validated['new_proposals'] ?? [],
            $user,
            null // Supervisors don't have student_group_id
        );
        
        $allProposals = array_merge($result['updated'], $result['created']);
        $proposalIds = collect($allProposals)->pluck('id')->toArray();
        
        return response()->json([
            'success' => true,
            'data' => ProposalResource::collection(Proposal::whereIn('id', $proposalIds)->with(['submitter', 'reviewer', 'project'])->get()),
            'message' => 'Proposals updated successfully',
        ]);
    }

    public function destroy(Request $request, Proposal $proposal): JsonResponse
    {
        $this->authorize('delete', $proposal);

        // Only allow deletion if proposal is in draft or pending_review status
        // Once approved or rejected, it should not be deleted
        if (!in_array($proposal->status, ['draft', 'pending_review', 'requires_modification'])) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete proposal that has been reviewed',
            ], 400);
        }

        try {
            $this->proposalService->delete($proposal);

            return response()->json([
                'success' => true,
                'message' => 'Proposal deleted successfully',
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
