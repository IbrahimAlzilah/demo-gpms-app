<?php

namespace App\Http\Controllers\Supervisor;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProposalResource;
use App\Http\Resources\ProposalSubmissionResource;
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

    /**
     * Get proposal submission
     */
    public function getSubmission(Request $request): JsonResponse
    {
        $user = $request->user();

        // Get existing submission or return null
        $submission = $this->proposalService->getExistingSubmission($user);

        return response()->json([
            'success' => true,
            'data' => $submission ? new ProposalSubmissionResource($submission->load('proposals')) : null,
        ]);
    }

    /**
     * Submit proposals
     */
    public function submitProposals(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Check if proposal submission window is active (supervisors restricted by this window)
        $timeWindowService = app(\App\Services\TimeWindowService::class);
        if (!$timeWindowService->isWindowActive(\App\Enums\TimePeriodType::PROPOSAL_SUBMISSION)) {
            return response()->json([
                'success' => false,
                'message' => 'Proposal submission is only allowed during the proposal submission window',
            ], 403);
        }

        // Check if user has already submitted
        if ($this->proposalService->hasSubmitted($user)) {
            return response()->json([
                'success' => false,
                'message' => 'You have already submitted a proposal submission. You can only edit existing proposals.',
            ], 422);
        }

        // Validate proposals array
        $validated = $request->validate([
            'proposals' => 'required|array|min:1|max:5',
            'proposals.*.title' => 'required|string|max:255',
            'proposals.*.description' => 'required|string',
            'proposals.*.proposed_supervisor_id' => 'nullable|exists:users,id',
            'proposals.*.team_members' => 'nullable|array',
            'proposals.*.team_members.*.name' => 'required_with:proposals.*.team_members|string|max:255',
            'proposals.*.team_members.*.role' => 'required_with:proposals.*.team_members|string|max:255',
        ]);

        // Validate proposed supervisors
        foreach ($validated['proposals'] as $proposalData) {
            if (isset($proposalData['proposed_supervisor_id'])) {
                $supervisor = \App\Models\User::find($proposalData['proposed_supervisor_id']);
                if (!$supervisor || !$supervisor->isSupervisor()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'The selected user is not a supervisor',
                    ], 422);
                }
            }
        }

        try {
            // Create submission with proposals (no student_group_id for supervisors)
            $submission = $this->proposalService->createSubmission(
                $validated['proposals'],
                $user,
                null
            );

            // Submit the submission
            $submission = $this->proposalService->submitSubmission($submission);

            return response()->json([
                'success' => true,
                'data' => new ProposalSubmissionResource($submission->load('proposals')),
                'message' => 'Proposals submitted successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Update proposal submission (allow editing proposals but prevent adding new ones)
     */
    public function updateSubmission(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Check if proposal submission window is active
        $timeWindowService = app(\App\Services\TimeWindowService::class);
        $canUpdate = $timeWindowService->isWindowActive(\App\Enums\TimePeriodType::PROPOSAL_SUBMISSION);
        
        $submission = $this->proposalService->getExistingSubmission($user);
        
        if (!$submission) {
            return response()->json([
                'success' => false,
                'message' => 'No submission found',
            ], 404);
        }

        // Allow update if window is active OR submission requires modification OR is still in draft
        $canUpdate = $canUpdate 
            || $submission->requiresModification()
            || $submission->allowsNewProposals();

        if (!$canUpdate) {
            return response()->json([
                'success' => false,
                'message' => 'Submission updates are only allowed during proposal submission window, or when revisions are requested.',
            ], 403);
        }

        // Check if user is the submitter
        if ($submission->submitter_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only update your own submission',
            ], 403);
        }

        // Validate proposals array
        $validated = $request->validate([
            'proposals' => 'required|array|min:1',
            'proposals.*.id' => 'nullable|exists:proposals,id',
            'proposals.*.title' => 'required|string|max:255',
            'proposals.*.description' => 'required|string',
            'proposals.*.proposed_supervisor_id' => 'nullable|exists:users,id',
            'proposals.*.team_members' => 'nullable|array',
            'proposals.*.team_members.*.name' => 'required_with:proposals.*.team_members|string|max:255',
            'proposals.*.team_members.*.role' => 'required_with:proposals.*.team_members|string|max:255',
        ]);

        // Validate proposed supervisors
        foreach ($validated['proposals'] as $proposalData) {
            if (isset($proposalData['proposed_supervisor_id'])) {
                $supervisor = \App\Models\User::find($proposalData['proposed_supervisor_id']);
                if (!$supervisor || !$supervisor->isSupervisor()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'The selected user is not a supervisor',
                    ], 422);
                }
            }
        }

        try {
            $submission = $this->proposalService->updateSubmission($submission, $validated['proposals'], $user);

            // If submission was in draft and is being updated, submit it
            if ($submission->status->value === 'draft' && $request->has('submit') && $request->input('submit') === true) {
                $submission = $this->proposalService->submitSubmission($submission);
            }

            return response()->json([
                'success' => true,
                'data' => new ProposalSubmissionResource($submission->load('proposals')),
                'message' => 'Submission updated successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Legacy index method - kept for backward compatibility
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Check if user has a submission
        $submission = $this->proposalService->getExistingSubmission($user);
        
        if ($submission) {
            // Return proposals from submission - use where() to get a Builder instead of HasMany
            $query = Proposal::where('submission_id', $submission->id)
                ->with(['submitter', 'reviewer', 'project']);
            $query = $this->applyTableQuery($query, $request);
            return response()->json($this->getPaginatedResponse($query, $request, ProposalResource::class));
        }

        // Return empty result if no submission
        return response()->json($this->getPaginatedResponse(
            Proposal::whereRaw('1 = 0'), // Empty query
            $request,
            ProposalResource::class
        ));
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
     * Legacy store method - redirects to submitProposals
     */
    public function store(Request $request): JsonResponse
    {
        return $this->submitProposals($request);
    }

    /**
     * Legacy update method - redirects to updateSubmission
     */
    public function update(Request $request, Proposal $proposal): JsonResponse
    {
        // Get submission for this proposal
        $submission = $proposal->submission;
        
        if (!$submission) {
            return response()->json([
                'success' => false,
                'message' => 'Proposal is not part of a submission',
            ], 404);
        }

        // Get all proposals from submission
        $proposalsData = $submission->proposals->map(function ($p) use ($proposal, $request) {
            if ($p->id === $proposal->id) {
                // Update the specific proposal with request data
                return [
                    'id' => $p->id,
                    'title' => $request->input('title', $p->title),
                    'description' => $request->input('description', $p->description),
                    'proposed_supervisor_id' => $request->input('proposed_supervisor_id', $p->proposed_supervisor_id),
                    'team_members' => $request->input('team_members', $p->team_members),
                ];
            }
            return [
                'id' => $p->id,
                'title' => $p->title,
                'description' => $p->description,
                'proposed_supervisor_id' => $p->proposed_supervisor_id,
                'team_members' => $p->team_members,
            ];
        })->toArray();

        // Create a new request with proposals array
        $newRequest = new Request(['proposals' => $proposalsData]);
        $newRequest->setUserResolver($request->getUserResolver());

        return $this->updateSubmission($newRequest);
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
