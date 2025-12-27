<?php

namespace App\Services;

use App\Models\ProjectGroup;
use App\Models\GroupInvitation;
use App\Models\User;
use App\Models\Project;
use Illuminate\Support\Facades\DB;

class GroupService
{
    /**
     * Create a new group
     */
    public function create(Project $project, User $leader, array $memberIds = []): ProjectGroup
    {
        if ($project->group) {
            throw new \Exception('Project already has a group');
        }

        return DB::transaction(function () use ($project, $leader, $memberIds) {
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

        $group->members()->attach($member->id);

        return $group->fresh();
    }

    /**
     * Remove member from group
     */
    public function removeMember(ProjectGroup $group, int $memberId): ProjectGroup
    {
        if ($group->leader_id === $memberId) {
            throw new \Exception('Cannot remove group leader');
        }

        if ($group->members()->count() <= 1) {
            throw new \Exception('Group must have at least one member');
        }

        $group->members()->detach($memberId);

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

        return DB::transaction(function () use ($invitation) {
            $group = $invitation->group;

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

