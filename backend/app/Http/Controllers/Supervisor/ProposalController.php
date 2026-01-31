<?php

namespace App\Http\Controllers\Supervisor;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProposalResource;
use App\Http\Traits\HasTableQuery;
use App\Models\Proposal;
use App\Services\ProposalService;
use App\Enums\ProposalStatus;
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
            'data' => new ProposalResource(
                $proposal->load([
                    'submitter',
                    'reviewer',
                    'project',
                    'studentGroup',
                    'assignedToGroup',
                    'proposedSupervisor',
                ])
            ),
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
     * Returns ALL proposals submitted by the supervisor (approved, rejected, pending).
     * Supervisors can add new proposals only when the submission period is open; only pending_review/requires_modification can be edited.
     */
    public function getSubmissionContext(Request $request): JsonResponse
    {
        $user = $request->user();
        $timeWindowService = app(\App\Services\TimeWindowService::class);
        $isSubmissionPeriodOpen = $timeWindowService->isWindowActive(\App\Enums\TimePeriodType::PROPOSAL_SUBMISSION);

        // Get ALL proposals submitted by the supervisor (all statuses)
        $allProposals = Proposal::where('submitter_id', $user->id)
            ->whereNull('student_group_id') // Only supervisor proposals
            ->with(['submitter', 'reviewer', 'project'])
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'group' => null, // Supervisors don't have groups
                'proposals' => ProposalResource::collection($allProposals),
                'can_edit' => true,
                'can_add_new' => $isSubmissionPeriodOpen,
            ],
        ]);
    }

    /**
     * Update multiple proposals and optionally add new ones (supervisor only)
     *
     * Supervisors can:
     * - Edit existing proposals that are pending_review or requires_modification (during active window or when requires_modification)
     * - Add NEW proposals only when the proposal submission period is open and active
     * - View all their proposals (approved, rejected, pending) on the Edit Proposals page
     */
    public function batchUpdate(Request $request): JsonResponse
    {
        $user = $request->user();
        $timeWindowService = app(\App\Services\TimeWindowService::class);

        // Check which window is active
        $isProposalSubmissionWindow = $timeWindowService->isWindowActive(\App\Enums\TimePeriodType::PROPOSAL_SUBMISSION);

        $hasNewProposals = !empty($request->input('new_proposals', []));

        // Adding NEW proposals is only allowed when the proposal submission period is open and active
        if ($hasNewProposals && !$isProposalSubmissionWindow) {
            return response()->json([
                'success' => false,
                'message' => 'Adding new proposals is only allowed during the proposal submission window. You can edit existing proposals that require modification at any time.',
                'code' => 'SUBMISSION_WINDOW_CLOSED',
            ], 403);
        }

        $proposalIds = $request->input('updates', []);
        $hasModificationRequired = false;
        if (!empty($proposalIds)) {
            $ids = array_column($proposalIds, 'id');
            $hasModificationRequired = Proposal::whereIn('id', $ids)
                ->where('submitter_id', $user->id)
                ->whereNull('student_group_id')
                ->where('status', 'requires_modification')
                ->exists();
        }

        $canUpdateExisting = $isProposalSubmissionWindow || $hasModificationRequired;

        // Block only when: no window, no modification required, no new proposals, and they are trying to update existing
        if (!$canUpdateExisting && !$hasNewProposals && !empty($proposalIds)) {
            return response()->json([
                'success' => false,
                'message' => 'Proposal updates are only allowed during proposal submission window, or when revisions are requested.',
            ], 403);
        }

        $validated = $request->validate([
            'updates' => 'nullable|array',
            'updates.*.id' => 'required|exists:proposals,id',
            'updates.*.title' => 'required|string|max:255',
            'updates.*.description' => 'required|string',
            'new_proposals' => 'nullable|array',
            'new_proposals.*.title' => 'required|string|max:255',
            'new_proposals.*.description' => 'required|string',
        ]);

        $updates = $validated['updates'] ?? [];

        // Validate updates - check authorization and ownership for each proposal
        foreach ($updates as $updateData) {
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

        // When outside submission window, only apply updates to proposals that require modification
        // (adding new proposals is always allowed; editing pending_review is restricted to the window)
        $updatesToApply = $updates;
        if (!$isProposalSubmissionWindow) {
            $updatesToApply = array_values(array_filter($updates, function ($updateData) use ($user) {
                $proposal = Proposal::find($updateData['id']);
                return $proposal
                    && $proposal->submitter_id === $user->id
                    && $proposal->student_group_id === null
                    && $proposal->status === \App\Enums\ProposalStatus::REQUIRES_MODIFICATION;
            }));
        }

        // Perform batch update
        $result = $this->proposalService->updateBatch(
            $updatesToApply,
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

        // Supervisors can only delete proposals while they are still pending review.
        // Once approved / rejected (or moved to any final state), deletion is not allowed.
        if ($proposal->status !== ProposalStatus::PENDING_REVIEW) {
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

    /**
     * List active student groups that can be assigned to a proposal (supervisor view)
     */
    public function getStudentGroups(Request $request): JsonResponse
    {
        // Only supervisors can query groups for assignment
        $user = $request->user();
        if (!$user || !$user->isSupervisor()) {
            return response()->json([
                'success' => false,
                'message' => 'Only supervisors can access student groups for assignment',
            ], 403);
        }

        $groups = \App\Models\StudentGroup::with(['leader'])
            ->where('status', 'active')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($group) {
                return [
                    'id' => (string) $group->id,
                    'name' => $group->name,
                    'code' => $group->group_code,
                    'leader' => $group->leader ? [
                        'id' => (string) $group->leader->id,
                        'name' => $group->leader->name,
                        'email' => $group->leader->email,
                    ] : null,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $groups,
        ]);
    }

    /**
     * Directly assign a student group to a supervisor proposal
     * and record supervision intent.
     */
    public function assignToGroup(Request $request, Proposal $proposal): JsonResponse
    {
        $this->authorize('update', $proposal);

        $user = $request->user();

        // Only allow assignment for proposals submitted by this supervisor
        if ($proposal->submitter_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only assign your own proposals to groups',
            ], 403);
        }

        // Only pending_review proposals can be assigned
        if (!$proposal->isPending()) {
            return response()->json([
                'success' => false,
                'message' => 'Only proposals in pending review status can be assigned to a group',
            ], 400);
        }

        $validated = $request->validate([
            'student_group_id' => 'required|exists:student_groups,id',
        ]);

        $group = \App\Models\StudentGroup::where('id', $validated['student_group_id'])
            ->where('status', 'active')
            ->first();

        if (!$group) {
            return response()->json([
                'success' => false,
                'message' => 'Selected group is not active or does not exist',
            ], 400);
        }

        // Link proposal to group and record supervisor intent
        $proposal->update([
            'student_group_id' => $group->id,
            'assigned_to_group_id' => $group->id,
            'assignment_type' => 'direct',
            'assigned_at' => now(),
            'proposed_supervisor_id' => $proposal->proposed_supervisor_id ?: $user->id,
        ]);

        return response()->json([
            'success' => true,
            'data' => new ProposalResource(
                $proposal->fresh()->load(['submitter', 'proposedSupervisor', 'studentGroup', 'assignedToGroup', 'project'])
            ),
            'message' => 'Proposal assigned to group successfully',
        ]);
    }

    /**
     * Request assignment of a supervisor proposal to a student group,
     * with optional notes explaining the supervision intent.
     */
    public function requestAssignment(Request $request, Proposal $proposal): JsonResponse
    {
        $this->authorize('update', $proposal);

        $user = $request->user();

        if ($proposal->submitter_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only request assignment for your own proposals',
            ], 403);
        }

        if (!$proposal->isPending()) {
            return response()->json([
                'success' => false,
                'message' => 'Only proposals in pending review status can be assigned to a group',
            ], 400);
        }

        $validated = $request->validate([
            'student_group_id' => 'required|exists:student_groups,id',
            'notes' => 'nullable|string',
        ]);

        $group = \App\Models\StudentGroup::where('id', $validated['student_group_id'])
            ->where('status', 'active')
            ->first();

        if (!$group) {
            return response()->json([
                'success' => false,
                'message' => 'Selected group is not active or does not exist',
            ], 400);
        }

        $updateData = [
            'student_group_id' => $group->id,
            'assigned_to_group_id' => $group->id,
            'assignment_type' => 'request',
            'assigned_at' => now(),
            'proposed_supervisor_id' => $proposal->proposed_supervisor_id ?: $user->id,
        ];

        // Optionally append notes to review_notes for committee visibility (without changing logic)
        if (!empty($validated['notes'])) {
            $prefix = $proposal->review_notes ? $proposal->review_notes . "\n\n" : '';
            $updateData['review_notes'] = $prefix . 'Supervisor assignment request notes: ' . $validated['notes'];
        }

        $proposal->update($updateData);

        return response()->json([
            'success' => true,
            'data' => new ProposalResource(
                $proposal->fresh()->load(['submitter', 'proposedSupervisor', 'studentGroup', 'assignedToGroup', 'project'])
            ),
            'message' => 'Assignment request recorded successfully',
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
