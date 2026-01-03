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

        // Supervisor can view their own proposals
        if ($user->isSupervisor() && $proposal->submitter_id === $user->id) {
            return true;
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

        // Submitter can update their own proposal if pending
        return $proposal->submitter_id === $user->id 
            && $proposal->status === ProposalStatus::PENDING_REVIEW;
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

        // Submitter can delete their own proposal if pending
        return $proposal->submitter_id === $user->id 
            && $proposal->status === ProposalStatus::PENDING_REVIEW;
    }
}
