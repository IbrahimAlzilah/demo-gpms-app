<?php

namespace App\Http\Controllers\ProjectsCommittee;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProposalResource;
use App\Http\Resources\ProposalSubmissionResource;
use App\Http\Traits\HasTableQuery;
use App\Models\Proposal;
use App\Models\ProposalSubmission;
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
     * Search students for proposal submission
     */
    public function searchStudents(Request $request): JsonResponse
    {
        $search = $request->input('query');
        
        $students = \App\Models\User::where('role', 'student')
            ->where('status', 'active')
            ->when($search, function ($q) use ($search) {
                return $q->where(function ($subQ) use ($search) {
                    $subQ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('university_id', 'like', "%{$search}%");
                });
            })
            ->limit(20)
            ->get(['id', 'name', 'email', 'university_id']);

        return response()->json([
            'success' => true,
            'data' => $students,
        ]);
    }

    /**
     * List proposal submissions (not individual proposals)
     */
    public function index(Request $request): JsonResponse
    {
        $query = ProposalSubmission::with(['submitter', 'reviewer', 'studentGroup', 'proposals']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $query = $this->applyTableQuery($query, $request);

        return response()->json($this->getPaginatedResponse($query, $request, ProposalSubmissionResource::class));
    }

    /**
     * Show a proposal submission with all proposals
     */
    public function show(ProposalSubmission $proposalSubmission): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new ProposalSubmissionResource($proposalSubmission->load(['submitter', 'reviewer', 'studentGroup', 'proposals'])),
        ]);
    }

    /**
     * Approve a proposal submission
     */
    public function approve(Request $request, ProposalSubmission $proposalSubmission): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => 'nullable|exists:projects,id',
        ]);

        try {
            $approved = $this->proposalService->approveSubmission(
                $proposalSubmission,
                $request->user(),
                $validated['project_id'] ?? null
            );

            return response()->json([
                'success' => true,
                'data' => new ProposalSubmissionResource($approved->load(['submitter', 'reviewer', 'proposals'])),
                'message' => 'Proposal submission approved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Reject a proposal submission
     */
    public function reject(Request $request, ProposalSubmission $proposalSubmission): JsonResponse
    {
        $validated = $request->validate([
            'review_notes' => 'nullable|string',
        ]);

        try {
            $rejected = $this->proposalService->rejectSubmission(
                $proposalSubmission,
                $request->user(),
                $validated['review_notes'] ?? null
            );

            return response()->json([
                'success' => true,
                'data' => new ProposalSubmissionResource($rejected->load(['submitter', 'reviewer', 'proposals'])),
                'message' => 'Proposal submission rejected',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Request modification for a proposal submission
     */
    public function requestModification(Request $request, ProposalSubmission $proposalSubmission): JsonResponse
    {
        $validated = $request->validate([
            'review_notes' => 'required|string',
        ]);

        try {
            $updated = $this->proposalService->requestSubmissionModification(
                $proposalSubmission,
                $request->user(),
                $validated['review_notes']
            );

            return response()->json([
                'success' => true,
                'data' => new ProposalSubmissionResource($updated->load(['submitter', 'reviewer', 'proposals'])),
                'message' => 'Modification requested',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Update a proposal submission (edit proposals within submission)
     */
    public function update(Request $request, ProposalSubmission $proposalSubmission): JsonResponse
    {
        // Validate proposals array
        $validated = $request->validate([
            'proposals' => 'required|array|min:1',
            'proposals.*.id' => 'required|exists:proposals,id',
            'proposals.*.title' => 'required|string|max:255',
            'proposals.*.description' => 'required|string',
        ]);

        try {
            // Update each proposal in the submission
            foreach ($validated['proposals'] as $proposalData) {
                $proposal = Proposal::findOrFail($proposalData['id']);
                
                // Verify proposal belongs to this submission
                if ($proposal->submission_id !== $proposalSubmission->id) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Proposal does not belong to this submission',
                    ], 422);
                }

                // Update proposal (committee can only edit title and description)
                $this->proposalService->update($proposal, [
                    'title' => $proposalData['title'],
                    'description' => $proposalData['description'],
                ], $request->user());
            }

            $proposalSubmission = $proposalSubmission->fresh()->load(['submitter', 'reviewer', 'proposals']);

            return response()->json([
                'success' => true,
                'data' => new ProposalSubmissionResource($proposalSubmission),
                'message' => 'Proposal submission updated successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Delete a proposal submission
     */
    public function destroy(Request $request, ProposalSubmission $proposalSubmission): JsonResponse
    {
        try {
            // Delete all proposals in the submission
            foreach ($proposalSubmission->proposals as $proposal) {
                $this->proposalService->delete($proposal);
            }

            // Delete the submission
            $proposalSubmission->delete();

            return response()->json([
                'success' => true,
                'message' => 'Proposal submission deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Legacy methods for backward compatibility with individual proposals
     */
    public function approveProposal(Request $request, Proposal $proposal): JsonResponse
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

    public function rejectProposal(Request $request, Proposal $proposal): JsonResponse
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

    public function requestProposalModification(Request $request, Proposal $proposal): JsonResponse
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

    /**
     * Create a proposal on behalf of a student or student group
     * Project Committee is not restricted by time windows
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'proposed_supervisor_id' => 'nullable|exists:users,id',
            'submitter_id' => 'required|exists:users,id',
            'student_group_id' => 'nullable|exists:student_groups,id',
            'target_project_id' => 'nullable|exists:projects,id',
            'team_members' => 'nullable|array',
            'team_members.*.name' => 'required_with:team_members|string|max:255',
            'team_members.*.role' => 'required_with:team_members|string|max:255',
        ]);

        // Validate that submitter_id is a student
        $submitter = \App\Models\User::findOrFail($validated['submitter_id']);
        if (!$submitter->isStudent()) {
            return response()->json([
                'success' => false,
                'message' => 'Submitter must be a student',
            ], 422);
        }

        // If student_group_id is provided, validate submitter is a member
        if (isset($validated['student_group_id'])) {
            $studentGroup = \App\Models\StudentGroup::findOrFail($validated['student_group_id']);
            if (!$studentGroup->hasMember($submitter->id) && $studentGroup->leader_id !== $submitter->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Submitter must be a member of the selected group',
                ], 422);
            }
        }

        // Validate that proposed_supervisor_id is actually a supervisor
        if (isset($validated['proposed_supervisor_id'])) {
            $supervisor = \App\Models\User::find($validated['proposed_supervisor_id']);
            if (!$supervisor || !$supervisor->isSupervisor()) {
                return response()->json([
                    'success' => false,
                    'message' => 'The selected user is not a supervisor',
                ], 422);
            }
        }

        try {
            $proposal = $this->proposalService->create($validated, $submitter);

            return response()->json([
                'success' => true,
                'data' => new ProposalResource($proposal->load(['submitter', 'proposedSupervisor', 'studentGroup', 'targetProject'])),
                'message' => 'Proposal created successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}
