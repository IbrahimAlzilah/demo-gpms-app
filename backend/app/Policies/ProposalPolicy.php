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
        // Projects committee can view all proposals
        if ($user->isProjectsCommittee()) {
            return true;
        }

        // For students: only group leaders can view proposals (if proposal has a group)
        if ($user->isStudent()) {
            if ($proposal->student_group_id) {
                $group = \App\Models\StudentGroup::find($proposal->student_group_id);
                if ($group && $group->leader_id === $user->id) {
                    return true;
                }
                return false; // Non-leaders cannot view group proposals
            }
            // If no group, submitter can view
            if ($proposal->submitter_id === $user->id) {
                return true;
            }
        }

        // Submitter can always view their own proposal (for supervisors)
        if ($proposal->submitter_id === $user->id) {
            return true;
        }

        // All students and supervisors can view approved proposals
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

        // For students: only group leaders can update proposals (if proposal has a group)
        if ($user->isStudent()) {
            if ($proposal->student_group_id) {
                $group = \App\Models\StudentGroup::find($proposal->student_group_id);
                if ($group && $group->leader_id === $user->id && $proposal->status->canBeModified()) {
                    return true;
                }
                return false; // Non-leaders cannot update group proposals
            }
            // If no group, submitter can update
            if ($proposal->submitter_id === $user->id && $proposal->status->canBeModified()) {
                return true;
            }
        }

        // Submitter can update their own proposal if it can be modified (for supervisors)
        return $proposal->submitter_id === $user->id 
            && $proposal->status->canBeModified();
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

        // For students: only group leaders can delete proposals (if proposal has a group)
        if ($user->isStudent()) {
            if ($proposal->student_group_id) {
                $group = \App\Models\StudentGroup::find($proposal->student_group_id);
                if ($group && $group->leader_id === $user->id && $proposal->status->canBeModified()) {
                    return true;
                }
                return false; // Non-leaders cannot delete group proposals
            }
            // If no group, submitter can delete
            if ($proposal->submitter_id === $user->id && $proposal->status->canBeModified()) {
                return true;
            }
        }

        // Submitter can delete their own proposal if it can be modified (for supervisors)
        return $proposal->submitter_id === $user->id 
            && $proposal->status->canBeModified();
    }
}
