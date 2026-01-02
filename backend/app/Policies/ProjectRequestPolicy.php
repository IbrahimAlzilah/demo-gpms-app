<?php

namespace App\Policies;

use App\Models\ProjectRequest;
use App\Models\User;

class ProjectRequestPolicy
{
    /**
     * Determine if the user can view any requests.
     */
    public function viewAny(User $user): bool
    {
        return true; // All authenticated users can view requests relevant to them
    }

    /**
     * Determine if the user can view the request.
     */
    public function view(User $user, ProjectRequest $request): bool
    {
        // Student who created the request can view it
        if ($user->isStudent() && $request->student_id === $user->id) {
            return true;
        }

        // Supervisor of the related project can view it
        if ($user->isSupervisor() && $request->project && $request->project->supervisor_id === $user->id) {
            return true;
        }

        // Projects committee can view all requests
        if ($user->isProjectsCommittee()) {
            return true;
        }

        return false;
    }

    /**
     * Determine if the user can create requests.
     */
    public function create(User $user): bool
    {
        // Only students can create change requests
        return $user->isStudent();
    }

    /**
     * Determine if the user can update the request.
     */
    public function update(User $user, ProjectRequest $request): bool
    {
        // Only the student who created it can update (if still pending)
        return $user->isStudent()
            && $request->student_id === $user->id
            && $request->status === 'pending';
    }

    /**
     * Determine if the user can cancel the request.
     */
    public function cancel(User $user, ProjectRequest $request): bool
    {
        // Student can cancel their own pending request
        return $user->isStudent()
            && $request->student_id === $user->id
            && $request->status === 'pending';
    }

    /**
     * Determine if the user can approve as supervisor.
     */
    public function supervisorApprove(User $user, ProjectRequest $request): bool
    {
        // Supervisor of the related project can approve
        if (!$user->isSupervisor() || !$request->project) {
            return false;
        }

        return $request->project->supervisor_id === $user->id
            && $request->status === 'pending';
    }

    /**
     * Determine if the user can approve as committee.
     */
    public function committeeApprove(User $user, ProjectRequest $request): bool
    {
        // Projects committee can approve/reject
        return $user->isProjectsCommittee()
            && in_array($request->status, ['pending', 'supervisor_approved']);
    }
}
