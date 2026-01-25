<?php

namespace App\Services;

use App\Models\StudentGroup;
use App\Models\StudentGroupInvitation;
use App\Models\StudentGroupJoinRequest;
use App\Models\User;
use App\Services\SettingsService;
use Illuminate\Support\Facades\DB;

class StudentGroupService
{
    public function __construct(
        protected SettingsService $settingsService
    ) {}

    /**
     * Create a new student group
     */
    public function create(User $leader, ?string $name = null, array $memberIds = []): StudentGroup
    {
        if (!$leader->isStudent()) {
            throw new \Exception('Only students can create groups');
        }

        $minMembers = $this->settingsService->getGroupMinMembers();
        $maxMembers = $this->settingsService->getGroupMaxMembers();

        // Check if leader is already in an active group
        $existingGroup = StudentGroup::where(function ($query) use ($leader) {
            $query->where('leader_id', $leader->id)
                ->orWhereHas('members', function ($q) use ($leader) {
                    $q->where('users.id', $leader->id);
                });
        })
        ->where('status', 'active')
        ->first();

        if ($existingGroup) {
            throw new \Exception('You are already a member of an active group');
        }

        // Validate member count (including leader)
        // Only enforce maximum at creation time - minimum is enforced when registering/submitting proposals
        $totalMembers = count($memberIds) + 1; // +1 for leader
        if ($totalMembers > $maxMembers) {
            throw new \Exception("Group cannot have more than {$maxMembers} members");
        }

        return DB::transaction(function () use ($leader, $name, $memberIds) {
            $group = StudentGroup::create([
                'name' => $name,
                'leader_id' => $leader->id,
                'status' => 'active',
            ]);

            // Note: Leader is NOT added to members() pivot table.
            // Leader is tracked separately via leader_id column.
            // getTotalMemberCount() adds +1 for leader, so adding them
            // to members() would cause double-counting.

            // Add other members to group
            if (!empty($memberIds)) {
                // Validate all members are students and not in other groups
                foreach ($memberIds as $memberId) {
                    $member = User::findOrFail($memberId);
                    if (!$member->isStudent()) {
                        throw new \Exception("User {$member->name} is not a student");
                    }

                    // Check if member is already in an active group (as leader or member)
                    $memberGroup = StudentGroup::where(function ($query) use ($member) {
                        $query->where('leader_id', $member->id)
                            ->orWhereHas('members', function ($q) use ($member) {
                                $q->where('users.id', $member->id);
                            });
                    })
                    ->where('status', 'active')
                    ->first();

                    if ($memberGroup) {
                        throw new \Exception("Student {$member->name} is already a member of another active group");
                    }
                }

                $group->members()->attach($memberIds);
            }

            // Don't enforce minimum at creation - allow groups with just the leader
            // Minimum will be enforced when registering for projects or submitting proposals

            return $group->fresh()->load(['leader', 'members']);
        });
    }

    /**
     * Add member to group
     */
    public function addMember(StudentGroup $group, User $member): StudentGroup
    {
        $this->ensureGroupNotAssigned($group);

        if ($group->status !== 'active') {
            throw new \Exception('Cannot add members to an inactive group');
        }

        if (!$member->isStudent()) {
            throw new \Exception('Only students can be added to groups');
        }

        if ($group->isFull()) {
            $maxMembers = $this->settingsService->getGroupMaxMembers();
            throw new \Exception("Group is full (maximum {$maxMembers} members)");
        }

        if ($group->hasMember($member->id)) {
            throw new \Exception('Member is already in the group');
        }

        // Check if member is already in another active group (as leader or member)
        $existingGroup = StudentGroup::where(function ($query) use ($member) {
            $query->where('leader_id', $member->id)
                ->orWhereHas('members', function ($q) use ($member) {
                    $q->where('users.id', $member->id);
                });
        })
        ->where('status', 'active')
        ->where('id', '!=', $group->id)
        ->first();

        if ($existingGroup) {
            throw new \Exception('Student is already a member of another active group');
        }

        $group->members()->attach($member->id);

        return $group->fresh()->load(['leader', 'members']);
    }

    /**
     * Remove member from group
     */
    public function removeMember(StudentGroup $group, User $member): StudentGroup
    {
        $this->ensureGroupNotAssigned($group);

        if ($group->leader_id === $member->id) {
            throw new \Exception('Cannot remove group leader. Change leader first.');
        }

        if (!$group->hasMember($member->id)) {
            throw new \Exception('User is not a member of this group');
        }

        $minMembers = $this->settingsService->getGroupMinMembers();
        $currentTotal = $group->getTotalMemberCount(); // Includes leader
        if (($currentTotal - 1) < $minMembers) {
            throw new \Exception("Group must have at least {$minMembers} members");
        }

        $group->members()->detach($member->id);

        return $group->fresh()->load(['leader', 'members']);
    }

    /**
     * Update group leader
     */
    public function updateLeader(StudentGroup $group, User $newLeader): StudentGroup
    {
        // Allow leader changes before and during project registration (per UC-ST-04)
        // Only block after group is assigned to a project (approved registration)
        $this->ensureGroupNotAssigned($group);

        if (!$group->hasMember($newLeader->id)) {
            throw new \Exception('New leader must be a member of the group');
        }

        $group->update(['leader_id' => $newLeader->id]);

        return $group->fresh()->load(['leader', 'members']);
    }

    /**
     * Send group invitation
     */
    public function inviteMember(StudentGroup $group, User $inviter, User $invitee, ?string $message = null): StudentGroupInvitation
    {
        $this->ensureGroupNotAssigned($group);

        // Verify inviter is leader of the group
        if ($group->leader_id !== $inviter->id) {
            throw new \Exception('Only the group leader can invite new members');
        }

        if ($group->isFull()) {
            $maxMembers = $this->settingsService->getGroupMaxMembers();
            throw new \Exception("Group is full (maximum {$maxMembers} members)");
        }

        if ($group->hasMember($invitee->id)) {
            throw new \Exception('User is already a member of this group');
        }

        if (!$invitee->isStudent()) {
            throw new \Exception('Only students can be invited to groups');
        }

        // Check if invitee is already in another active group (as leader or member)
        $existingGroup = StudentGroup::where(function ($query) use ($invitee) {
            $query->where('leader_id', $invitee->id)
                ->orWhereHas('members', function ($q) use ($invitee) {
                    $q->where('users.id', $invitee->id);
                });
        })
        ->where('status', 'active')
        ->where('id', '!=', $group->id)
        ->first();

        if ($existingGroup) {
            throw new \Exception('Student is already a member of another active group');
        }

        // Check for existing pending invitation
        $existingInvitation = StudentGroupInvitation::where('group_id', $group->id)
            ->where('invitee_id', $invitee->id)
            ->where('status', 'pending')
            ->first();

        if ($existingInvitation) {
            throw new \Exception('Invitation already sent to this user');
        }

        $invitation = StudentGroupInvitation::create([
            'group_id' => $group->id,
            'inviter_id' => $inviter->id,
            'invitee_id' => $invitee->id,
            'status' => 'pending',
            'message' => $message,
        ]);

        // Create notification for match invitee
        \App\Models\Notification::create([
            'user_id' => $invitee->id,
            'message' => json_encode([
                'key' => 'notifications.groups.invitation_received',
                'params' => [
                    'group_name' => $group->name,
                    'inviter_name' => $inviter->name,
                ],
            ]),
            'type' => 'group_invitation',
            'related_entity_type' => StudentGroupInvitation::class,
            'related_entity_id' => $invitation->id,
        ]);

        return $invitation;
    }

    /**
     * Accept group invitation
     */
    public function acceptInvitation(StudentGroupInvitation $invitation, User $invitee): StudentGroup
    {
        $this->ensureGroupNotAssigned($invitation->group);

        if ($invitation->invitee_id !== $invitee->id) {
            throw new \Exception('Unauthorized to accept this invitation');
        }

        if (!$invitation->isPending()) {
            throw new \Exception('Invitation is no longer valid');
        }

        return DB::transaction(function () use ($invitation, $invitee) {
            $group = $invitation->group;

            if ($group->isFull()) {
                throw new \Exception('Group is now full');
            }

            // Check if student is already in another active group (as leader or member)
            $existingGroup = StudentGroup::where(function ($query) use ($invitee) {
                $query->where('leader_id', $invitee->id)
                    ->orWhereHas('members', function ($q) use ($invitee) {
                        $q->where('users.id', $invitee->id);
                    });
            })
            ->where('status', 'active')
            ->where('id', '!=', $group->id)
            ->first();

            if ($existingGroup) {
                throw new \Exception('You are already a member of another active group');
            }

            // Add student to group members
            $group->members()->attach($invitation->invitee_id);

            // Update invitation status
            $invitation->update(['status' => 'accepted']);

            // Notify group leader
            \App\Models\Notification::create([
                'user_id' => $group->leader_id,
                'message' => json_encode([
                    'key' => 'notifications.groups.invitation_accepted',
                    'params' => [
                        'student_name' => $invitee->name,
                        'group_name' => $group->name,
                    ],
                ]),
                'type' => 'group_invitation_accepted',
                'related_entity_type' => StudentGroup::class,
                'related_entity_id' => $group->id,
            ]);

            return $group->fresh()->load(['leader', 'members']);
        });
    }

    /**
     * Reject group invitation
     */
    public function rejectInvitation(StudentGroupInvitation $invitation, User $invitee): void
    {
        if ($invitation->invitee_id !== $invitee->id) {
            throw new \Exception('Unauthorized to reject this invitation');
        }

        if (!$invitation->isPending()) {
            throw new \Exception('Invitation is no longer valid');
        }

        $invitation->update(['status' => 'rejected']);

        // Notify group leader
        $group = $invitation->group;
        \App\Models\Notification::create([
            'user_id' => $group->leader_id,
            'message' => json_encode([
                'key' => 'notifications.groups.invitation_rejected',
                'params' => [
                    'student_name' => $invitee->name,
                    'group_name' => $group->name,
                ],
            ]),
            'type' => 'group_invitation_rejected',
            'related_entity_type' => StudentGroup::class,
            'related_entity_id' => $group->id,
        ]);
    }

    /**
     * Create a join request for a group
     */
    public function createJoinRequest(StudentGroup $group, User $student, ?string $message = null): StudentGroupJoinRequest
    {
        if ($group->isFull()) {
            $maxMembers = $this->settingsService->getGroupMaxMembers();
            throw new \Exception("Group is full (maximum {$maxMembers} members)");
        }

        if ($group->hasMember($student->id)) {
            throw new \Exception('You are already a member of this group');
        }

        if (!$student->isStudent()) {
            throw new \Exception('Only students can request to join groups');
        }

        // Check if student is already in another active group (as leader or member)
        $existingGroup = StudentGroup::where(function ($query) use ($student) {
            $query->where('leader_id', $student->id)
                ->orWhereHas('members', function ($q) use ($student) {
                    $q->where('users.id', $student->id);
                });
        })
        ->where('status', 'active')
        ->where('id', '!=', $group->id)
        ->first();

        if ($existingGroup) {
            throw new \Exception('You are already a member of another active group');
        }

        // Check for existing pending request
        $existingRequest = StudentGroupJoinRequest::where('group_id', $group->id)
            ->where('student_id', $student->id)
            ->where('status', 'pending')
            ->first();

        if ($existingRequest) {
            throw new \Exception('You already have a pending join request for this group');
        }

        $request = StudentGroupJoinRequest::create([
            'group_id' => $group->id,
            'student_id' => $student->id,
            'status' => 'pending',
            'message' => $message,
            'requested_at' => now(),
        ]);

        // Notify group leader
        \App\Models\Notification::create([
            'user_id' => $group->leader_id,
            'message' => json_encode([
                'key' => 'notifications.groups.join_request_received',
                'params' => [
                    'student_name' => $student->name,
                    'group_name' => $group->name,
                ],
            ]),
            'type' => 'group_join_request',
            'related_entity_type' => StudentGroupJoinRequest::class,
            'related_entity_id' => $request->id,
        ]);

        return $request;
    }

    /**
     * Approve a join request
     */
    public function approveJoinRequest(StudentGroupJoinRequest $request, User $reviewer): StudentGroup
    {
        $this->ensureGroupNotAssigned($request->group);

        // Verify reviewer is the group leader
        if ($request->group->leader_id !== $reviewer->id) {
            throw new \Exception('Only the group leader can approve join requests');
        }

        if (!$request->isPending()) {
            throw new \Exception('Join request is no longer valid');
        }

        return DB::transaction(function () use ($request, $reviewer) {
            $group = $request->group;
            $student = $request->student;

            if ($group->isFull()) {
                throw new \Exception('Group is now full');
            }

            // Check if student is already in another active group (as leader or member)
            $existingGroup = StudentGroup::where(function ($query) use ($student) {
                $query->where('leader_id', $student->id)
                    ->orWhereHas('members', function ($q) use ($student) {
                        $q->where('users.id', $student->id);
                    });
            })
            ->where('status', 'active')
            ->where('id', '!=', $group->id)
            ->first();

            if ($existingGroup) {
                throw new \Exception('Student is already a member of another active group');
            }

            // Add student to group members
            $group->members()->attach($student->id);

            // Update request status
            $request->update([
                'status' => 'approved',
                'reviewed_at' => now(),
                'reviewed_by' => $reviewer->id,
            ]);

            // Notify student
            \App\Models\Notification::create([
                'user_id' => $student->id,
                'message' => json_encode([
                    'key' => 'notifications.groups.join_request_approved',
                    'params' => [
                        'group_name' => $group->name,
                    ],
                ]),
                'type' => 'group_join_request_approved',
                'related_entity_type' => StudentGroup::class,
                'related_entity_id' => $group->id,
            ]);

            return $group->fresh()->load(['leader', 'members']);
        });
    }

    /**
     * Reject a join request
     */
    public function rejectJoinRequest(StudentGroupJoinRequest $request, User $reviewer, ?string $comments = null): void
    {
        // Verify reviewer is the group leader
        if ($request->group->leader_id !== $reviewer->id) {
            throw new \Exception('Only the group leader can reject join requests');
        }

        if (!$request->isPending()) {
            throw new \Exception('Join request is no longer valid');
        }

        $request->update([
            'status' => 'rejected',
            'reviewed_at' => now(),
            'reviewed_by' => $reviewer->id,
            'review_comments' => $comments,
        ]);

        // Notify student
        $group = $request->group;
        \App\Models\Notification::create([
            'user_id' => $request->student_id,
            'message' => json_encode([
                'key' => 'notifications.groups.join_request_rejected',
                'params' => [
                    'group_name' => $group->name,
                ],
            ]),
            'type' => 'group_join_request_rejected',
            'related_entity_type' => StudentGroup::class,
            'related_entity_id' => $group->id,
        ]);
    }

    /**
     * Ensure group is not assigned to any project
     */
    protected function ensureGroupNotAssigned(StudentGroup $group): void
    {
        if ($group->assignedProjects()->exists()) {
            throw new \Exception('Group is already assigned to a project. Member changes must be requested via the Project Committee.');
        }
    }

    /**
     * Leave group (DISABLED - members cannot leave groups)
     * 
     * Note: Student members are not allowed to leave groups.
     * Only group leaders can delete the group, which removes all members.
     * This method is kept for backward compatibility but will throw an exception for members.
     */
    public function leaveGroup(StudentGroup $group, User $user): void
    {
        if (!$group->hasMember($user->id)) {
            throw new \Exception('You are not a member of this group');
        }

        // Prevent members (non-leaders) from leaving the group
        if ($group->leader_id !== $user->id) {
            throw new \Exception('Student members cannot leave groups. Only the group leader can delete the group.');
        }

        // If user is the leader, check for project registrations
        if ($group->leader_id === $user->id) {
            if ($group->hasProjectRegistrations()) {
                throw new \Exception('Cannot leave group. The group has project registrations. You must delete the group instead, which will remove all members.');
            }
        }

        // If leader is leaving and no registrations, delete the group
        // This will cascade delete all members and related data
        // Also delete pending review proposals associated with the group
        DB::transaction(function () use ($group) {
            // Delete ALL proposals with status 'Pending Review' associated with this group
            $deletedCount = \App\Models\Proposal::where('student_group_id', $group->id)
                ->where('status', \App\Enums\ProposalStatus::PENDING_REVIEW->value)
                ->delete();

            // Log if any proposals were deleted (optional, for debugging)
            if ($deletedCount > 0) {
                \Log::info("Deleted {$deletedCount} pending review proposal(s) when group leader left group", [
                    'group_id' => $group->id,
                    'deleted_proposals_count' => $deletedCount
                ]);
            }

            // Delete the group (will cascade delete members, invitations, join requests)
            $group->delete();
        });
    }

    /**
     * Delete group (leader only)
     * Can only delete if group has no project registrations
     * Automatically deletes ALL associated proposals with status 'Pending Review'
     */
    public function deleteGroup(StudentGroup $group, User $user): void
    {
        // Only leader can delete the group
        if ($group->leader_id !== $user->id) {
            throw new \Exception('Only the group leader can delete the group');
        }

        // Check if group has any project registrations
        if ($group->hasProjectRegistrations()) {
            throw new \Exception('Cannot delete group. The group has project registrations. Please cancel all registrations first.');
        }

        DB::transaction(function () use ($group) {
            // Delete ALL proposals with status 'Pending Review' associated with this group
            $deletedCount = \App\Models\Proposal::where('student_group_id', $group->id)
                ->where('status', \App\Enums\ProposalStatus::PENDING_REVIEW->value)
                ->delete();

            // Log if any proposals were deleted (optional, for debugging)
            if ($deletedCount > 0) {
                \Log::info("Deleted {$deletedCount} pending review proposal(s) when group was deleted", [
                    'group_id' => $group->id,
                    'deleted_proposals_count' => $deletedCount
                ]);
            }

            // Delete the group (will cascade delete members, invitations, join requests)
            $group->delete();
        });
    }
}
