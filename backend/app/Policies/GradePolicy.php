<?php

namespace App\Policies;

use App\Models\Grade;
use App\Models\User;

class GradePolicy
{
    /**
     * Determine if the user can view the grade.
     */
    public function view(User $user, Grade $grade): bool
    {
        // Student can view their own grade
        if ($user->isStudent() && $grade->student_id === $user->id) {
            return true;
        }

        // Supervisor can view grades of their projects
        if ($user->isSupervisor() && $grade->project && $grade->project->supervisor_id === $user->id) {
            return true;
        }

        // Discussion committee can view grades of assigned projects
        if ($user->isDiscussionCommittee() && $grade->project) {
            return $grade->project->committeeMembers()->where('users.id', $user->id)->exists();
        }

        // Projects committee can view all grades
        if ($user->isProjectsCommittee()) {
            return true;
        }

        return false;
    }

    /**
     * Determine if the user can update supervisor grade.
     */
    public function updateSupervisorGrade(User $user, Grade $grade): bool
    {
        // Only supervisor of the project can update supervisor grade
        if (!$user->isSupervisor()) {
            return false;
        }

        if (!$grade->project || $grade->project->supervisor_id !== $user->id) {
            return false;
        }

        // Cannot update if already approved
        return !$grade->is_approved;
    }

    /**
     * Determine if the user can update committee grade.
     */
    public function updateCommitteeGrade(User $user, Grade $grade): bool
    {
        // Only discussion committee member assigned to the project
        if (!$user->isDiscussionCommittee()) {
            return false;
        }

        if (!$grade->project) {
            return false;
        }

        $isAssigned = $grade->project->committeeMembers()->where('users.id', $user->id)->exists();
        if (!$isAssigned) {
            return false;
        }

        // Cannot update if already approved
        return !$grade->is_approved;
    }

    /**
     * Determine if the user can approve the grade.
     */
    public function approve(User $user, Grade $grade): bool
    {
        // Only projects committee can approve grades
        return $user->isProjectsCommittee();
    }
}
