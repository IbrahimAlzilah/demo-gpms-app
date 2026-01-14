<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\User;

class DocumentPolicy
{
    /**
     * Determine if the user can view the document.
     */
    public function view(User $user, Document $document): bool
    {
        // Students can view documents of projects they are registered in
        if ($user->isStudent() && $document->project) {
            if ($document->project->students()->where('users.id', $user->id)->exists()) {
                return true;
            }
        }

        // Supervisor can view documents of their projects
        if ($user->isSupervisor() && $document->project && $document->project->supervisor_id === $user->id) {
            return true;
        }

        // Projects committee can view all documents
        if ($user->isProjectsCommittee()) {
            return true;
        }

        // Discussion committee can view documents of assigned projects
        if ($user->isDiscussionCommittee() && $document->project) {
            return $document->project->committeeMembers()->where('users.id', $user->id)->exists();
        }

        return false;
    }

    /**
     * Determine if the user can delete the document.
     */
    public function delete(User $user, Document $document): bool
    {
        // Students can delete documents if they are registered in the project
        if ($user->isStudent() && $document->project) {
            return $document->project->students()->where('users.id', $user->id)->exists();
        }

        // Projects committee can delete any document
        if ($user->isProjectsCommittee()) {
            return true;
        }

        return false;
    }
}
