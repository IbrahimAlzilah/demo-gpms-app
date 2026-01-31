<?php

namespace App\Policies;

use App\Models\SupervisorAssignmentRequest;
use App\Models\User;

class SupervisorAssignmentRequestPolicy
{
    /**
     * Determine if the user can view any assignment requests.
     */
    public function viewAny(User $user): bool
    {
        return $user->isProjectsCommittee() || $user->isSupervisor();
    }

    /**
     * Determine if the user can view the assignment request.
     */
    public function view(User $user, SupervisorAssignmentRequest $request): bool
    {
        if ($user->isProjectsCommittee()) {
            return true;
        }

        if ($user->isSupervisor() && $request->supervisor_id === $user->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine if the user can create assignment requests.
     */
    public function create(User $user): bool
    {
        return $user->isProjectsCommittee();
    }

    /**
     * Determine if the user can update the assignment request.
     */
    public function update(User $user, SupervisorAssignmentRequest $request): bool
    {
        return false;
    }

    /**
     * Determine if the user can delete (cancel) the assignment request.
     */
    public function delete(User $user, SupervisorAssignmentRequest $request): bool
    {
        return $user->isProjectsCommittee() && $request->isPending();
    }
}
