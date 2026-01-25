<?php

namespace App\Policies;

use App\Models\Proposal;
use App\Models\User;
use App\Enums\ProposalStatus;

class ProposalPolicy
{
    /**
     * Determine if the user can view the proposal.
     */
    public function view(User $user, Proposal $proposal): bool
    {
        // Submitter can always view their own proposal
        if ($proposal->submitter_id === $user->id) {
            return true;
        }

        // Projects committee can view all proposals
        if ($user->isProjectsCommittee()) {
            return true;
        }

        // Group members can view proposals from their own group
        if ($proposal->student_group_id) {
            $studentGroup = \App\Models\StudentGroup::where('status', 'active')
                ->find($proposal->student_group_id);
            
            if ($studentGroup) {
                // Check if user is the leader
                if ($studentGroup->leader_id === $user->id) {
                    return true;
                }
                
                // Check if user is a member of the group
                if ($studentGroup->hasMember($user->id)) {
                    return true;
                }
            }
        }

        // All students and supervisors can view approved proposals (from any group)
        if ($proposal->status === ProposalStatus::APPROVED) {
            if ($user->isStudent() || $user->isSupervisor()) {
                return true;
            }
        }

        return false;
    }

    /**
     * Determine if the user can update the proposal.
     */
    public function update(User $user, Proposal $proposal): bool
    {
        // Projects committee can update any proposal
        if ($user->isProjectsCommittee()) {
            return true;
        }

        // Must be submitter AND proposal must be modifiable
        if ($proposal->submitter_id !== $user->id || !$proposal->status->canBeModified()) {
            return false;
        }

        // For supervisors: allow update if they're the submitter (no group restriction)
        if ($user->isSupervisor()) {
            return true;
        }

        // For students: must be group leader if proposal belongs to a group
        if ($proposal->student_group_id) {
            $studentGroup = \App\Models\StudentGroup::where('status', 'active')
                ->find($proposal->student_group_id);
            if (!$studentGroup || $studentGroup->leader_id !== $user->id) {
                return false;
            }

            // CRITICAL: Group-level validation - check ALL proposals in the group
            // Editing is only allowed when:
            // 1. ALL proposals in the group are in pending_review or requires_modification status
            // 2. NO proposal in the group has been approved
            $allGroupProposals = Proposal::where('student_group_id', $studentGroup->id)
                ->where('submitter_id', $user->id)
                ->get();

            // Check if ANY proposal is approved - if so, editing is not allowed
            $hasApprovedProposal = $allGroupProposals->contains(function ($groupProposal) {
                return $groupProposal->status === ProposalStatus::APPROVED;
            });

            if ($hasApprovedProposal) {
                return false;
            }

            // Check if ALL proposals are in pending_review or requires_modification status
            $allPendingReview = $allGroupProposals->every(function ($groupProposal) {
                return in_array($groupProposal->status, [
                    ProposalStatus::PENDING_REVIEW,
                    ProposalStatus::REQUIRES_MODIFICATION
                ]);
            });

            if (!$allPendingReview) {
                return false;
            }
        } else {
            // ENFORCE: Solo proposals are not allowed - must be in a group
            return false;
        }

        return true;
    }

    /**
     * Determine if the user can delete the proposal.
     */
    public function delete(User $user, Proposal $proposal): bool
    {
        // Projects committee can delete any proposal
        if ($user->isProjectsCommittee()) {
            return true;
        }

        // For students: must be submitter AND proposal must be modifiable
        if ($proposal->submitter_id !== $user->id || !$proposal->status->canBeModified()) {
            return false;
        }

        // ENFORCE: If proposal belongs to a group, user must be the group leader
        if ($proposal->student_group_id) {
            $studentGroup = \App\Models\StudentGroup::where('status', 'active')
                ->find($proposal->student_group_id);
            if (!$studentGroup || $studentGroup->leader_id !== $user->id) {
                return false;
            }
        } else {
            // ENFORCE: Solo proposals are not allowed - must be in a group
            return false;
        }

        return true;
    }
}
