<?php

namespace App\Services;

use App\Models\ProjectGroup;
use App\Models\GroupInvitation;
use App\Models\User;
use App\Models\Project;
use App\Models\ProjectRegistration;
use Illuminate\Support\Facades\DB;

class GroupService
{
    /**
     * Check if a student has approved registration for a project
     */
    protected function hasApprovedRegistration(User $student, Project $project): bool
    {
        // Check if student is directly attached to project (approved registration)
        if ($project->students()->where('users.id', $student->id)->exists()) {
            return true;
        }

        // Check if student has an approved registration
        return ProjectRegistration::where('project_id', $project->id)
            ->where('student_id', $student->id)
            ->where('status', 'approved')
            ->exists();
    }

    /**
     * Create a new group
     */
    public function create(Project $project, User $leader, array $memberIds = []): ProjectGroup
    {
        if ($project->group) {
            throw new \Exception('Project already has a group');
        }

        // Verify leader has approved registration
        if (!$this->hasApprovedRegistration($leader, $project)) {
            throw new \Exception('You must have an approved registration for this project to create a group');
        }

        return DB::transaction(function () use ($project, $leader, $memberIds) {
            // Verify all members have approved registration
            if (!empty($memberIds)) {
                foreach ($memberIds as $memberId) {
                    $member = User::findOrFail($memberId);
                    if (!$this->hasApprovedRegistration($member, $project)) {
                        throw new \Exception("Student {$member->name} does not have an approved registration for this project");
                    }
                }
            }

            $group = ProjectGroup::create([
                'project_id' => $project->id,
                'leader_id' => $leader->id,
                'max_members' => $project->max_students,
            ]);

            // Add leader as member
            $group->members()->attach($leader->id);

            // Add other members
            if (!empty($memberIds)) {
                $group->members()->attach($memberIds);
            }

            return $group->fresh();
        });
    }

    /**
     * Add member to group
     */
    public function addMember(ProjectGroup $group, User $member): ProjectGroup
    {
        if ($group->isFull()) {
            throw new \Exception('Group is full');
        }

        if ($group->hasMember($member->id)) {
            throw new \Exception('Member is already in the group');
        }

        // Verify member has approved registration for the project
        $project = $group->project;
        if (!$this->hasApprovedRegistration($member, $project)) {
            throw new \Exception('Student must have an approved registration for this project to join the group');
        }

        $group->members()->attach($member->id);

        return $group->fresh();
    }

    /**
     * Remove member from group
     */
    public function removeMember(ProjectGroup $group, User $member): ProjectGroup
    {
        if ($group->leader_id === $member->id) {
            throw new \Exception('Cannot remove group leader');
        }

        if ($group->members()->count() <= 1) {
            throw new \Exception('Group must have at least one member');
        }

        if (!$group->hasMember($member->id)) {
            throw new \Exception('User is not a member of this group');
        }

        $group->members()->detach($member->id);

        return $group->fresh();
    }

    /**
     * Update group leader
     */
    public function updateLeader(ProjectGroup $group, User $newLeader): ProjectGroup
    {
        if (!$group->hasMember($newLeader->id)) {
            throw new \Exception('New leader must be a member of the group');
        }

        $group->update(['leader_id' => $newLeader->id]);

        return $group->fresh();
    }

    /**
     * Send group invitation
     */
    public function inviteMember(ProjectGroup $group, User $inviter, User $invitee, ?string $message = null): GroupInvitation
    {
        if ($group->isFull()) {
            throw new \Exception('Group is full');
        }

        if ($group->hasMember($invitee->id)) {
            throw new \Exception('User is already a member of this group');
        }

        // Check for existing pending invitation
        $existingInvitation = GroupInvitation::where('group_id', $group->id)
            ->where('invitee_id', $invitee->id)
            ->where('status', 'pending')
            ->first();

        if ($existingInvitation) {
            throw new \Exception('Invitation already sent to this user');
        }

        return GroupInvitation::create([
            'group_id' => $group->id,
            'inviter_id' => $inviter->id,
            'invitee_id' => $invitee->id,
            'status' => 'pending',
            'message' => $message,
        ]);
    }

    /**
     * Accept group invitation
     */
    public function acceptInvitation(GroupInvitation $invitation, User $invitee): ProjectGroup
    {
        if ($invitation->invitee_id !== $invitee->id) {
            throw new \Exception('Unauthorized to accept this invitation');
        }

        if (!$invitation->isPending()) {
            throw new \Exception('Invitation is no longer valid');
        }

        return DB::transaction(function () use ($invitation, $invitee) {
            $group = $invitation->group;
            $project = $group->project;

            // Verify invitee has approved registration
            if (!$this->hasApprovedRegistration($invitee, $project)) {
                throw new \Exception('You must have an approved registration for this project to accept the invitation');
            }

            if ($group->isFull()) {
                throw new \Exception('Group is now full');
            }

            $group->members()->attach($invitation->invitee_id);
            $invitation->update(['status' => 'accepted']);

            return $group->fresh();
        });
    }

    /**
     * Reject group invitation
     */
    public function rejectInvitation(GroupInvitation $invitation, User $invitee): void
    {
        if ($invitation->invitee_id !== $invitee->id) {
            throw new \Exception('Unauthorized to reject this invitation');
        }

        if (!$invitation->isPending()) {
            throw new \Exception('Invitation is no longer valid');
        }

        $invitation->update(['status' => 'rejected']);
    }
}

