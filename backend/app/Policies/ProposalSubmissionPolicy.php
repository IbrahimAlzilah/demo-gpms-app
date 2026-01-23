<?php

namespace App\Policies;

use App\Models\ProposalSubmission;
use App\Models\User;
use App\Enums\ProposalSubmissionStatus;

class ProposalSubmissionPolicy
{
    /**
     * Determine if the user can view the proposal submission.
     */
    public function view(User $user, ProposalSubmission $submission): bool
    {
        // Projects committee can view all submissions
        if ($user->isProjectsCommittee()) {
            return true;
        }

        // For students: only group leaders can view submissions
        if ($user->isStudent()) {
            if ($submission->student_group_id) {
                $group = \App\Models\StudentGroup::find($submission->student_group_id);
                if ($group && $group->leader_id === $user->id) {
                    return true;
                }
                return false; // Non-leaders cannot view group submissions
            }
            // If no group, submitter can view
            if ($submission->submitter_id === $user->id) {
                return true;
            }
        }

        // Submitter can view their own submission (for supervisors)
        return $submission->submitter_id === $user->id;
    }

    /**
     * Determine if the user can create a proposal submission.
     * - During Proposal Submission period: Any student can create (individual submission allowed)
     * - During Project Registration period: Only group leaders can create
     */
    public function create(User $user): bool
    {
        // For students: check period type
        if ($user->isStudent()) {
            $timeWindowService = app(\App\Services\TimeWindowService::class);
            $isProposalSubmissionWindow = $timeWindowService->isWindowActive(\App\Enums\TimePeriodType::PROPOSAL_SUBMISSION);
            $isRegistrationWindow = $timeWindowService->isWindowActive(\App\Enums\TimePeriodType::PROJECT_REGISTRATION);
            
            // During Project Registration period: only group leaders can create
            if ($isRegistrationWindow && !$isProposalSubmissionWindow) {
                $group = \App\Models\StudentGroup::where('status', 'active')
                    ->where('leader_id', $user->id)
                    ->first();
                return $group !== null;
            }
            
            // During Proposal Submission period: any student can create (individual submission allowed)
            // Or if no active window, allow (will be checked in controller)
            return true;
        }

        // Supervisors can create submissions
        return $user->isSupervisor();
    }

    /**
     * Determine if the user can update the proposal submission.
     */
    public function update(User $user, ProposalSubmission $submission): bool
    {
        // Projects committee can update any submission
        if ($user->isProjectsCommittee()) {
            return true;
        }

        // For students: only group leaders can update submissions
        if ($user->isStudent()) {
            if ($submission->student_group_id) {
                $group = \App\Models\StudentGroup::find($submission->student_group_id);
                if ($group && $group->leader_id === $user->id && $submission->canBeModified()) {
                    return true;
                }
                return false; // Non-leaders cannot update group submissions
            }
            // If no group, submitter can update
            if ($submission->submitter_id === $user->id && $submission->canBeModified()) {
                return true;
            }
        }

        // Submitter can update their own submission if it can be modified (for supervisors)
        return $submission->submitter_id === $user->id 
            && $submission->canBeModified();
    }

    /**
     * Determine if the user can delete the proposal submission.
     */
    public function delete(User $user, ProposalSubmission $submission): bool
    {
        // Projects committee can delete any submission
        if ($user->isProjectsCommittee()) {
            return true;
        }

        // For students: only group leaders can delete submissions
        if ($user->isStudent()) {
            if ($submission->student_group_id) {
                $group = \App\Models\StudentGroup::find($submission->student_group_id);
                if ($group && $group->leader_id === $user->id && $submission->canBeModified()) {
                    return true;
                }
                return false; // Non-leaders cannot delete group submissions
            }
            // If no group, submitter can delete
            if ($submission->submitter_id === $user->id && $submission->canBeModified()) {
                return true;
            }
        }

        // Submitter can delete their own submission if it can be modified (for supervisors)
        return $submission->submitter_id === $user->id 
            && $submission->canBeModified();
    }
}
