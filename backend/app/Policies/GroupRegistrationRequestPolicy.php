<?php

namespace App\Policies;

use App\Models\GroupRegistrationRequest;
use App\Models\User;

class GroupRegistrationRequestPolicy
{
    /**
     * Determine if the user can view any group registration requests.
     */
    public function viewAny(User $user): bool
    {
        // Only projects committee can view all group registration requests
        return $user->isProjectsCommittee();
    }

    /**
     * Determine if the user can view the group registration request.
     */
    public function view(User $user, GroupRegistrationRequest $request): bool
    {
        // Projects committee can view any request
        if ($user->isProjectsCommittee()) {
            return true;
        }

        // Students can view their own group's requests
        if ($user->isStudent()) {
            // Check if user is the group leader
            if ($request->submitted_by === $user->id) {
                return true;
            }

            // Check if user is a member of the group
            $studentGroup = $request->studentGroup;
            if ($studentGroup && $studentGroup->hasMember($user->id)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Determine if the user can approve the group registration request.
     */
    public function approve(User $user, GroupRegistrationRequest $request): bool
    {
        // Only projects committee can approve requests
        if (!$user->isProjectsCommittee()) {
            return false;
        }

        // Can only approve pending requests
        return $request->isPending();
    }

    /**
     * Determine if the user can reject the group registration request.
     */
    public function reject(User $user, GroupRegistrationRequest $request): bool
    {
        // Only projects committee can reject requests
        if (!$user->isProjectsCommittee()) {
            return false;
        }

        // Can only reject pending requests
        return $request->isPending();
    }
}
