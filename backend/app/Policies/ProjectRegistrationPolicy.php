<?php

namespace App\Policies;

use App\Models\ProjectRegistration;
use App\Models\User;

class ProjectRegistrationPolicy
{
    /**
     * Determine if the user can view any registrations.
     */
    public function viewAny(User $user): bool
    {
        // Only projects committee can view all registrations
        return $user->isProjectsCommittee();
    }

    /**
     * Determine if the user can view the registration.
     */
    public function view(User $user, ProjectRegistration $registration): bool
    {
        // Student can view their own registration
        if ($user->isStudent() && $registration->student_id === $user->id) {
            return true;
        }

        // Projects committee can view all registrations
        if ($user->isProjectsCommittee()) {
            return true;
        }

        return false;
    }

    /**
     * Determine if the user can approve the registration.
     */
    public function approve(User $user, ProjectRegistration $registration): bool
    {
        // Only projects committee can approve registrations
        if (!$user->isProjectsCommittee()) {
            return false;
        }

        // Can only approve pending registrations
        return $registration->status === 'pending';
    }

    /**
     * Determine if the user can reject the registration.
     */
    public function reject(User $user, ProjectRegistration $registration): bool
    {
        // Only projects committee can reject registrations
        if (!$user->isProjectsCommittee()) {
            return false;
        }

        // Can only reject pending registrations
        return $registration->status === 'pending';
    }

    /**
     * Determine if the user can cancel the registration.
     */
    public function cancel(User $user, ProjectRegistration $registration): bool
    {
        // Check if registration belongs to a group request
        if ($registration->group_registration_request_id) {
            $groupRequest = $registration->groupRegistrationRequest;
            
            // Only group leader can cancel
            if ($groupRequest->submitted_by !== $user->id) {
                return false;
            }
            
            // Can only cancel if request is pending
            return $groupRequest->isPending();
        }
        
        // Legacy single registration: student can cancel their own pending registration
        if ($user->isStudent() && $registration->student_id === $user->id) {
            return $registration->status === 'pending';
        }
        
        return false;
    }
}
