<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;
use App\Enums\ProjectStatus;

class ProjectPolicy
{
    /**
     * Determine if the user can view any projects.
     */
    public function viewAny(User $user): bool
    {
        // All authenticated users can view projects list
        return true;
    }

    /**
     * Determine if the user can view the project.
     */
    public function view(User $user, Project $project): bool
    {
        // Students can view published projects (available_for_registration or visible statuses)
        if ($user->isStudent()) {
            // Check if project is visible to students (published)
            if ($project->isVisibleToStudents()) {
                return true;
            }
            // Or if student is registered in the project
            if ($project->students()->where('users.id', $user->id)->exists()) {
                return true;
            }
            return false;
        }

        // Supervisor can view their own projects
        if ($user->isSupervisor() && $project->supervisor_id === $user->id) {
            return true;
        }

        // Projects committee can view all projects
        if ($user->isProjectsCommittee()) {
            return true;
        }

        // Discussion committee can view assigned projects
        if ($user->isDiscussionCommittee()) {
            return $project->committeeMembers()->where('users.id', $user->id)->exists();
        }

        return false;
    }

    /**
     * Determine if the user can create projects.
     */
    public function create(User $user): bool
    {
        // Only projects committee can create projects directly
        return $user->isProjectsCommittee();
    }

    /**
     * Determine if the user can update the project.
     */
    public function update(User $user, Project $project): bool
    {
        // Projects committee can update any project
        if ($user->isProjectsCommittee()) {
            return true;
        }

        // Supervisor can update their own projects (limited fields)
        if ($user->isSupervisor() && $project->supervisor_id === $user->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine if the user can delete the project.
     */
    public function delete(User $user, Project $project): bool
    {
        // Only projects committee can delete projects
        return $user->isProjectsCommittee() && $project->status === ProjectStatus::DRAFT;
    }

    /**
     * Determine if the user can register for the project.
     */
    public function register(User $user, Project $project): bool
    {
        // Only students can register
        if (!$user->isStudent()) {
            return false;
        }

        // Project must be available for registration
        if (!$project->isAvailableForRegistration()) {
            return false;
        }

        // Student should not be already registered in this project
        if ($project->students()->where('users.id', $user->id)->exists()) {
            return false;
        }

        // Check if student already has a pending registration for this project
        $existingRegistration = \App\Models\ProjectRegistration::where('student_id', $user->id)
            ->where('project_id', $project->id)
            ->where('status', 'pending')
            ->exists();

        if ($existingRegistration) {
            return false;
        }

        // Check if student already has a pending registration for any project
        $hasPendingRegistration = \App\Models\ProjectRegistration::where('student_id', $user->id)
            ->where('status', 'pending')
            ->exists();

        if ($hasPendingRegistration) {
            return false;
        }

        // Check if student already has an approved project
        $hasProject = Project::whereHas('students', function ($query) use ($user) {
            $query->where('users.id', $user->id);
        })->exists();

        return !$hasProject;
    }
}
