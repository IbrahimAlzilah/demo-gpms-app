<?php

namespace App\Http\Controllers\Student;

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
        $user = $request->user();
        $query = Proposal::with(['submitter', 'reviewer', 'project', 'studentGroup', 'targetProject']);

        // Get filters from request
        $filters = $request->get('filters', []);

        // Get user's active group (if any)
        $userGroup = \App\Models\StudentGroup::where('status', 'active')
            ->where(function ($query) use ($user) {
                $query->where('leader_id', $user->id)
                    ->orWhereHas('members', function ($q) use ($user) {
                        $q->where('users.id', $user->id);
                    });
            })
            ->first();

        $isLeader = $userGroup && $userGroup->leader_id === $user->id;

        // For "My Proposals" route: filter by submitter_id (user's proposals)
        // For "Approved Proposals" route: show approved proposals from user's group
        if (isset($filters['submitterId'])) {
            // Explicitly filter by submitterId (for "My Proposals")
            // If user is in a group, show all group proposals; otherwise show only user's proposals
            if ($userGroup) {
                $query->where('student_group_id', $userGroup->id);
            } else {
                $query->where('submitter_id', $filters['submitterId']);
            }
        } elseif (isset($filters['status']) && $filters['status'] === 'approved') {
            // For "Approved Proposals": show ALL approved proposals across the system
            $query->where('status', 'approved');
        } else {
            // Default behavior: show proposals from user's group (if in group) or user's proposals
            if ($userGroup) {
                // Group member or leader: show all proposals from their group
                $query->where('student_group_id', $userGroup->id);
            } else {
                // Solo student: show only their own proposals
                $query->where('submitter_id', $user->id);
            }
        }

        $query = $this->applyTableQuery($query, $request);

        return response()->json($this->getPaginatedResponse($query, $request, ProposalResource::class));
    }

    /**
     * Get submission context for editing (group leader only)
     * Returns the group and all proposals submitted by the leader for that group
     */
    public function getSubmissionContext(Request $request): JsonResponse
    {
        $user = $request->user();

        // Get user's active group where they are the leader
        $userGroup = \App\Models\StudentGroup::where('status', 'active')
            ->where('leader_id', $user->id)
            ->first();

        // ENFORCE: Only group leaders can access submission context
        if (!$userGroup) {
            return response()->json([
                'success' => false,
                'message' => 'Only group leaders can access submission context. You must be the leader of an active student group.',
            ], 403);
        }

        // Get ALL proposals for this group submitted by the leader (to check statuses)
        $allProposals = Proposal::where('student_group_id', $userGroup->id)
            ->where('submitter_id', $user->id)
            ->with(['submitter', 'reviewer', 'proposedSupervisor', 'studentGroup', 'targetProject', 'project'])
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

        // Get only editable proposals for this group submitted by the leader
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
                'group' => new \App\Http\Resources\StudentGroupResource($userGroup),
                'proposals' => ProposalResource::collection($proposals),
                'can_edit' => true,
            ],
        ]);
    }

    /**
     * Submit multiple proposals in a batch (group leader only)
     */
    public function batchSubmit(Request $request): JsonResponse
    {
        $user = $request->user();
        $timeWindowService = app(\App\Services\TimeWindowService::class);

        // Check which time window is active
        $isProposalSubmissionWindow = $timeWindowService->isWindowActive(\App\Enums\TimePeriodType::PROPOSAL_SUBMISSION);
        $isRegistrationWindow = $timeWindowService->isWindowActive(\App\Enums\TimePeriodType::PROJECT_REGISTRATION);

        // Students (Group Leaders) can submit proposals during the Project Registration period
        // This allows them to both register for projects AND submit proposals at the same time
        if (!$isRegistrationWindow) {
            return response()->json([
                'success' => false,
                'message' => 'Proposal submission is only allowed during the project registration period. Please check the active time windows.',
                'error_key' => 'proposal.errors.periodClosed',
            ], 403);
        }

        $settingsService = app(\App\Services\SettingsService::class);
        $maxProposalsPerSubmission = $settingsService->getMaxProposalsPerGroupSubmission();
        $proposalTitleMaxLength = $settingsService->getProposalTitleMaxLength();

        // During registration window, target_project_id is optional
        // Students can submit general proposals OR target specific projects for registration
        $targetProjectRule = 'nullable|exists:projects,id';

        $validated = $request->validate([
            'student_group_id' => 'required|exists:student_groups,id',
            'proposals' => "required|array|min:1|max:{$maxProposalsPerSubmission}",
            'proposals.*.title' => "required|string|max:{$proposalTitleMaxLength}",
            'proposals.*.description' => 'required|string',
            'proposals.*.target_project_id' => $targetProjectRule,
        ]);

        $studentGroupId = $validated['student_group_id'];

        // CRITICAL: First check if student belongs to ANY group (as member or leader)
        $userGroupAsMember = \App\Models\StudentGroup::where('status', 'active')
            ->where(function ($query) use ($user) {
                $query->where('leader_id', $user->id)
                    ->orWhereHas('members', function ($q) use ($user) {
                        $q->where('users.id', $user->id);
                    });
            })
            ->first();

        if (!$userGroupAsMember) {
            return response()->json([
                'success' => false,
                'message' => 'You must join a group before submitting proposals. Please create or join a student group first.',
                'code' => 'NO_GROUP',
                'error_key' => 'proposal.groupRequiredMessage',
            ], 403);
        }

        // Get user's active group where they are the leader
        $userGroup = \App\Models\StudentGroup::where('status', 'active')
            ->where('leader_id', $user->id)
            ->first();

        // ENFORCE: Only group leaders can submit proposals (block solo students and non-leaders)
        if (!$userGroup) {
            return response()->json([
                'success' => false,
                'message' => 'Only group leaders can submit proposals. You must be the leader of an active student group.',
                'code' => 'NOT_LEADER',
                'error_key' => 'proposal.errors.onlyLeaderCanSubmit',
            ], 403);
        }

        // Must submit under their group
        if ((int)$studentGroupId !== $userGroup->id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only submit proposals for your own group.',
                'error_key' => 'proposal.errors.submitOwnGroupOnly',
            ], 403);
        }

        // Check if group is locked from new submissions
        if ($this->proposalService->isGroupLocked($studentGroupId)) {
            return response()->json([
                'success' => false,
                'message' => 'New proposal submissions are not allowed after the first submission.',
                'code' => 'SUBMISSION_LOCKED',
                'error_key' => 'proposal.errors.submissionLocked',
            ], 403);
        }

        // Validate group size requirements
        // During proposal submission window: allow group leader to submit regardless of group size
        // During registration window: enforce minimum member requirement
        $maxMembers = app(\App\Services\SettingsService::class)->getGroupMaxMembers();
        $totalMembers = $userGroup->getTotalMemberCount();

        // Only enforce minimum members during registration window (not during proposal submission)
        if ($isRegistrationWindow) {
            $minMembers = app(\App\Services\SettingsService::class)->getGroupMinMembers();
            if ($totalMembers < $minMembers) {
                return response()->json([
                    'success' => false,
                    'message' => "Group must have at least {$minMembers} members to submit proposals during registration window",
                    'error_key' => 'proposal.errors.groupMinMembersRegistration',
                    'error_params' => ['count' => $minMembers],
                ], 422);
            }
        }

        // Always enforce maximum members
        if ($totalMembers > $maxMembers) {
            return response()->json([
                'success' => false,
                'message' => "Group cannot have more than {$maxMembers} members",
                'error_key' => 'proposal.errors.groupMaxMembers',
                'error_params' => ['count' => $maxMembers],
            ], 422);
        }


        // Create batch
        $proposals = $this->proposalService->createBatch($validated['proposals'], $user, $studentGroupId);

        return response()->json([
            'success' => true,
            'data' => ProposalResource::collection(Proposal::whereIn('id', collect($proposals)->pluck('id'))->with(['submitter', 'proposedSupervisor', 'studentGroup'])->get()),
            'message' => count($proposals) === 1 ? 'Proposal created successfully' : count($proposals) . ' proposals created successfully',
        ], 201);
    }

    /**
     * Update multiple proposals and optionally add new ones (group leader only)
     */
    public function batchUpdate(Request $request): JsonResponse
    {
        $user = $request->user();
        $timeWindowService = app(\App\Services\TimeWindowService::class);

        // Check which window is active
        $isProposalSubmissionWindow = $timeWindowService->isWindowActive(\App\Enums\TimePeriodType::PROPOSAL_SUBMISSION);
        $isRegistrationWindow = $timeWindowService->isWindowActive(\App\Enums\TimePeriodType::PROJECT_REGISTRATION);

        // Students can update proposals during active windows OR when proposal requires modification
        $canUpdate = $isProposalSubmissionWindow || $isRegistrationWindow;

        if (!$canUpdate) {
            // Check if any proposal requires modification (allows editing even outside windows)
            $proposalIds = $request->input('updates', []);
            $hasModificationRequired = false;
            if (!empty($proposalIds)) {
                $ids = array_column($proposalIds, 'id');
                $hasModificationRequired = Proposal::whereIn('id', $ids)
                    ->where('status', 'requires_modification')
                    ->exists();
            }

            if (!$hasModificationRequired) {
                return response()->json([
                    'success' => false,
                    'message' => 'Proposal updates are only allowed during proposal submission or project registration windows, or when revisions are requested.',
                ], 403);
            }
        }

        // Dynamic validation: target_project_id is optional in both windows
        // Students can submit general proposals OR target specific projects
        $settingsService = app(\App\Services\SettingsService::class);
        $maxProposalsPerSubmission = $settingsService->getMaxProposalsPerGroupSubmission();
        $proposalTitleMaxLength = $settingsService->getProposalTitleMaxLength();
        $targetProjectRule = 'nullable|exists:projects,id';

        $validated = $request->validate([
            'student_group_id' => 'nullable|exists:student_groups,id',
            'updates' => 'required|array',
            'updates.*.id' => 'required|exists:proposals,id',
            'updates.*.title' => "required|string|max:{$proposalTitleMaxLength}",
            'updates.*.description' => 'required|string',
            'new_proposals' => 'nullable|array',
            "new_proposals.*.title" => "required|string|max:{$proposalTitleMaxLength}",
            'new_proposals.*.description' => 'required|string',
            'new_proposals.*.target_project_id' => $targetProjectRule,
        ]);

        $studentGroupId = $validated['student_group_id'] ?? null;

        // Get user's active group where they are the leader
        $userGroup = \App\Models\StudentGroup::where('status', 'active')
            ->where('leader_id', $user->id)
            ->first();

        // ENFORCE: Only group leaders can update proposals (block solo students)
        if (!$userGroup) {
            return response()->json([
                'success' => false,
                'message' => 'Only group leaders can update proposals. You must be the leader of an active student group.',
            ], 403);
        }

        // If student_group_id is provided, it must match the leader's group
        if ($studentGroupId && (int)$studentGroupId !== $userGroup->id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only update proposals for your own group.',
            ], 403);
        }

        // CRITICAL: Check if ALL proposals in the group are in pending_review status
        // If ANY proposal is approved, editing is not allowed
        $allGroupProposals = Proposal::where('student_group_id', $userGroup->id)
            ->where('submitter_id', $user->id)
            ->get();

        $hasApprovedProposal = $allGroupProposals->contains(function ($proposal) {
            return $proposal->status === \App\Enums\ProposalStatus::APPROVED;
        });

        if ($hasApprovedProposal) {
            return response()->json([
                'success' => false,
                'message' => 'Editing is not allowed. One or more proposals have already been approved by the Project Committee.',
            ], 403);
        }

        // Check if ALL proposals are in pending_review or requires_modification status
        $allPendingReview = $allGroupProposals->every(function ($proposal) {
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

        $newProposalsCount = count($validated['new_proposals'] ?? []);
        $totalAfterUpdate = $allGroupProposals->count() + $newProposalsCount;
        if ($totalAfterUpdate > $maxProposalsPerSubmission) {
            return response()->json([
                'success' => false,
                'message' => "Total proposals cannot exceed {$maxProposalsPerSubmission}. Current: {$allGroupProposals->count()}, adding: {$newProposalsCount}.",
                'error_key' => 'proposal.errors.maxProposalsExceeded',
                'error_params' => ['max' => $maxProposalsPerSubmission],
            ], 422);
        }

        // Validate updates - check authorization and ownership for each proposal
        foreach ($validated['updates'] as $updateData) {
            $proposal = Proposal::findOrFail($updateData['id']);

            // Check if user can update this proposal (throws exception if unauthorized)
            try {
                $this->authorize('update', $proposal);
            } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
                return response()->json([
                    'success' => false,
                    'message' => "You are not authorized to update proposal #{$proposal->id}",
                ], 403);
            }

            // Ensure proposal belongs to the leader's group
            if ($proposal->student_group_id !== $userGroup->id) {
                return response()->json([
                    'success' => false,
                    'message' => "Proposal #{$proposal->id} does not belong to your group.",
                ], 403);
            }

            // Ensure proposal was submitted by the leader
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

        // If adding new proposals, must be leader and use correct group
        if (!empty($validated['new_proposals'])) {
            if (!$studentGroupId) {
                return response()->json([
                    'success' => false,
                    'message' => 'student_group_id is required when adding new proposals.',
                ], 422);
            }

            if ((int)$studentGroupId !== $userGroup->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only add proposals for your own group.',
                ], 403);
            }
        }


        // Perform batch update
        $result = $this->proposalService->updateBatch(
            $validated['updates'],
            $validated['new_proposals'] ?? [],
            $user,
            $studentGroupId
        );

        $allProposals = array_merge($result['updated'], $result['created']);
        $proposalIds = collect($allProposals)->pluck('id')->toArray();

        return response()->json([
            'success' => true,
            'data' => ProposalResource::collection(Proposal::whereIn('id', $proposalIds)->with(['submitter', 'reviewer', 'proposedSupervisor', 'studentGroup', 'targetProject'])->get()),
            'message' => 'Proposals updated successfully',
        ]);
    }

    /**
     * Store a single proposal (deprecated - use batchSubmit instead)
     * This endpoint is kept for backward compatibility but enforces the same rules as batchSubmit
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $timeWindowService = app(\App\Services\TimeWindowService::class);

        // Check which time window is active
        $isProposalSubmissionWindow = $timeWindowService->isWindowActive(\App\Enums\TimePeriodType::PROPOSAL_SUBMISSION);
        $isRegistrationWindow = $timeWindowService->isWindowActive(\App\Enums\TimePeriodType::PROJECT_REGISTRATION);

        // Students (Group Leaders) can submit proposals during the Project Registration period
        // This allows them to both register for projects AND submit proposals at the same time
        if (!$isRegistrationWindow) {
            return response()->json([
                'success' => false,
                'message' => 'Proposal submission is only allowed during the project registration period. Please check the active time windows.',
                'error_key' => 'proposal.errors.periodClosed',
            ], 403);
        }

        // During registration window, target_project_id is optional
        // Students can submit general proposals OR target specific projects for registration
        $targetProjectRule = 'nullable|exists:projects,id';

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'student_group_id' => 'required|exists:student_groups,id',
            'target_project_id' => $targetProjectRule,
        ]);

        // CRITICAL: First check if student belongs to ANY group (as member or leader)
        $userGroupAsMember = \App\Models\StudentGroup::where('status', 'active')
            ->where(function ($query) use ($user) {
                $query->where('leader_id', $user->id)
                    ->orWhereHas('members', function ($q) use ($user) {
                        $q->where('users.id', $user->id);
                    });
            })
            ->first();

        if (!$userGroupAsMember) {
            return response()->json([
                'success' => false,
                'message' => 'You must join a group before submitting proposals. Please create or join a student group first.',
                'code' => 'NO_GROUP',
            ], 403);
        }

        // Get user's active group where they are the leader
        $userGroup = \App\Models\StudentGroup::where('status', 'active')
            ->where('leader_id', $user->id)
            ->first();

        // ENFORCE: Only group leaders can submit proposals (block solo students and non-leaders)
        if (!$userGroup) {
            return response()->json([
                'success' => false,
                'message' => 'Only group leaders can submit proposals. You must be the leader of an active student group.',
                'code' => 'NOT_LEADER',
                'error_key' => 'proposal.errors.onlyLeaderCanSubmit',
            ], 403);
        }

        // Must submit under their group
        if ((int)$validated['student_group_id'] !== $userGroup->id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only submit proposals for your own group.',
                'error_key' => 'proposal.errors.submitOwnGroupOnly',
            ], 403);
        }

        // ENFORCE: Check if group is locked from new submissions (after first submission)
        // This is the key rule: Only ONE initial submission is allowed. After that, new submissions are blocked.
        if ($this->proposalService->isGroupLocked($validated['student_group_id'])) {
            return response()->json([
                'success' => false,
                'message' => 'New proposal submissions are not allowed after the first submission. Please use the edit functionality to add new proposals to your existing submission.',
                'code' => 'SUBMISSION_LOCKED',
                'error_key' => 'proposal.errors.submissionLocked',
            ], 403);
        }

        $studentGroup = \App\Models\StudentGroup::findOrFail($validated['student_group_id']);

        // Validate group size requirements
        // During proposal submission window: allow group leader to submit regardless of group size
        // During registration window: enforce minimum member requirement
        $maxMembers = app(\App\Services\SettingsService::class)->getGroupMaxMembers();
        $totalMembers = $studentGroup->getTotalMemberCount();

        // Only enforce minimum members during registration window (not during proposal submission)
        if ($isRegistrationWindow) {
            $minMembers = app(\App\Services\SettingsService::class)->getGroupMinMembers();
            if ($totalMembers < $minMembers) {
                return response()->json([
                    'success' => false,
                    'message' => "Group must have at least {$minMembers} members to submit a proposal during registration window",
                    'error_key' => 'proposal.errors.groupMinMembersRegistration',
                    'error_params' => ['count' => $minMembers],
                ], 422);
            }
        }

        // Always enforce maximum members
        if ($totalMembers > $maxMembers) {
            return response()->json([
                'success' => false,
                'message' => "Group cannot have more than {$maxMembers} members",
                'error_key' => 'proposal.errors.groupMaxMembers',
                'error_params' => ['count' => $maxMembers],
            ], 422);
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

        // Create proposal and set lock if this is the first submission
        $proposal = $this->proposalService->create($validated, $user);

        // Set lock timestamp - this locks the group from future NEW submissions
        if (!$studentGroup->proposals_initial_submitted_at) {
            $studentGroup->update([
                'proposals_initial_submitted_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => new ProposalResource($proposal->load(['submitter', 'proposedSupervisor', 'studentGroup'])),
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

        $timeWindowService = app(\App\Services\TimeWindowService::class);

        // Check which window is active
        $isProposalSubmissionWindow = $timeWindowService->isWindowActive(\App\Enums\TimePeriodType::PROPOSAL_SUBMISSION);
        $isRegistrationWindow = $timeWindowService->isWindowActive(\App\Enums\TimePeriodType::PROJECT_REGISTRATION);

        // Students can update proposals during active windows OR when proposal requires modification
        $canUpdate = $isProposalSubmissionWindow || $isRegistrationWindow || $proposal->requiresModification();

        if (!$canUpdate) {
            return response()->json([
                'success' => false,
                'message' => 'Proposal updates are only allowed during proposal submission or project registration windows, or when revisions are requested.',
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
        ]);

        // Use service to update proposal (enforces status check)
        $proposal = $this->proposalService->update($proposal, $validated, $request->user());

        return response()->json([
            'success' => true,
            'data' => new ProposalResource($proposal->load(['submitter', 'reviewer', 'proposedSupervisor', 'studentGroup', 'targetProject'])),
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

