<?php

namespace App\Services;

use App\Models\ProjectGroup;
use App\Models\GroupInvitation;
use App\Models\GroupJoinRequest;
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
            // Ensure leader is added to project students if not already there
            if (!$project->students()->where('users.id', $leader->id)->exists()) {
                $project->students()->attach($leader->id);
                $project->increment('current_students');
            }

            // Verify and add all initial members
            if (!empty($memberIds)) {
                foreach ($memberIds as $memberId) {
                    $member = User::findOrFail($memberId);
                    if (!$this->hasApprovedRegistration($member, $project)) {
                        throw new \Exception("Student {$member->name} does not have an approved registration for this project");
                    }
                    
                    // Ensure member is added to project students
                    if (!$project->students()->where('users.id', $member->id)->exists()) {
                        $project->students()->attach($member->id);
                        $project->increment('current_students');
                    }
                }
            }

            $group = ProjectGroup::create([
                'project_id' => $project->id,
                'leader_id' => $leader->id,
                'max_members' => $project->max_students,
            ]);

            // Add leader as group member
            $group->members()->attach($leader->id);

            // Add other members to group
            if (!empty($memberIds)) {
                $group->members()->attach($memberIds);
            }

            return $group->fresh()->load(['project', 'leader', 'members']);
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

        $project = $group->project;

        // Check if student is already in another project
        $hasOtherProject = Project::whereHas('students', function ($query) use ($member) {
            $query->where('users.id', $member->id);
        })->where('id', '!=', $project->id)->exists();

        if ($hasOtherProject) {
            throw new \Exception('Student is already registered in another project');
        }

        return DB::transaction(function () use ($group, $member, $project) {
            // Add to group members
            $group->members()->attach($member->id);

            // Add to project if not already there
            if (!$project->students()->where('users.id', $member->id)->exists()) {
                $project->students()->attach($member->id);
                
                // Update project current_students count
                $project->increment('current_students');
                
                // Create or update project registration record as approved
                ProjectRegistration::updateOrCreate(
                    [
                        'project_id' => $project->id,
                        'student_id' => $member->id,
                    ],
                    [
                        'status' => 'approved',
                        'submitted_at' => now(),
                        'reviewed_at' => now(),
                        'reviewed_by' => $group->leader_id,
                        'review_comments' => 'Auto-approved by group leader',
                    ]
                );
            }

            return $group->fresh();
        });
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

        return DB::transaction(function () use ($group, $member) {
            $project = $group->project;

            // Remove from group members
            $group->members()->detach($member->id);

            // Remove from project students
            if ($project->students()->where('users.id', $member->id)->exists()) {
                $project->students()->detach($member->id);
                
                // Update project current_students count
                $project->decrement('current_students');
                
                // Update project registration to cancelled
                ProjectRegistration::where('project_id', $project->id)
                    ->where('student_id', $member->id)
                    ->update([
                        'status' => 'cancelled',
                        'review_comments' => 'Removed from group by leader',
                    ]);
            }

            return $group->fresh();
        });
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
        // Verify inviter is leader or member of the group
        if ($group->leader_id !== $inviter->id && !$group->hasMember($inviter->id)) {
            throw new \Exception('Only group leader or members can invite new members');
        }

        if ($group->isFull()) {
            throw new \Exception('Group is full');
        }

        if ($group->hasMember($invitee->id)) {
            throw new \Exception('User is already a member of this group');
        }

        // Check if invitee is already in another project
        $hasOtherProject = Project::whereHas('students', function ($query) use ($invitee) {
            $query->where('users.id', $invitee->id);
        })->where('id', '!=', $group->project_id)->exists();

        if ($hasOtherProject) {
            throw new \Exception('Student is already registered in another project');
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

            if ($group->isFull()) {
                throw new \Exception('Group is now full');
            }

            // Check if student is already in another project (prevent multiple project registrations)
            $hasOtherProject = Project::whereHas('students', function ($query) use ($invitee) {
                $query->where('users.id', $invitee->id);
            })->where('id', '!=', $project->id)->exists();

            if ($hasOtherProject) {
                throw new \Exception('You are already registered in another project');
            }

            // Add student to group members
            $group->members()->attach($invitation->invitee_id);

            // Add student to project (auto-approve registration when accepting invitation)
            if (!$project->students()->where('users.id', $invitee->id)->exists()) {
                $project->students()->attach($invitee->id);
                
                // Update project current_students count
                $project->increment('current_students');
                
                // Create or update project registration record as approved
                ProjectRegistration::updateOrCreate(
                    [
                        'project_id' => $project->id,
                        'student_id' => $invitee->id,
                    ],
                    [
                        'status' => 'approved',
                        'submitted_at' => now(),
                        'reviewed_at' => now(),
                        'reviewed_by' => $invitation->inviter_id,
                        'review_comments' => 'Auto-approved via group invitation',
                    ]
                );
            }

            // Update invitation status
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

    /**
     * Create a join request for a group
     */
    public function createJoinRequest(ProjectGroup $group, User $student, ?string $message = null): GroupJoinRequest
    {
        if ($group->isFull()) {
            throw new \Exception('Group is full');
        }

        if ($group->hasMember($student->id)) {
            throw new \Exception('You are already a member of this group');
        }

        // Check if student is already in another project
        $hasOtherProject = Project::whereHas('students', function ($query) use ($student) {
            $query->where('users.id', $student->id);
        })->where('id', '!=', $group->project_id)->exists();

        if ($hasOtherProject) {
            throw new \Exception('You are already registered in another project');
        }

        // Check for existing pending request
        $existingRequest = GroupJoinRequest::where('group_id', $group->id)
            ->where('student_id', $student->id)
            ->where('status', 'pending')
            ->first();

        if ($existingRequest) {
            throw new \Exception('You already have a pending join request for this group');
        }

        return GroupJoinRequest::create([
            'group_id' => $group->id,
            'student_id' => $student->id,
            'status' => 'pending',
            'message' => $message,
            'requested_at' => now(),
        ]);
    }

    /**
     * Approve a join request
     */
    public function approveJoinRequest(GroupJoinRequest $request, User $reviewer): ProjectGroup
    {
        // Verify reviewer is the group leader
        if ($request->group->leader_id !== $reviewer->id) {
            throw new \Exception('Only the group leader can approve join requests');
        }

        if (!$request->isPending()) {
            throw new \Exception('Join request is no longer valid');
        }

        return DB::transaction(function () use ($request, $reviewer) {
            $group = $request->group;
            $project = $group->project;
            $student = $request->student;

            if ($group->isFull()) {
                throw new \Exception('Group is now full');
            }

            // Check if student is already in another project
            $hasOtherProject = Project::whereHas('students', function ($query) use ($student) {
                $query->where('users.id', $student->id);
            })->where('id', '!=', $project->id)->exists();

            if ($hasOtherProject) {
                throw new \Exception('Student is already registered in another project');
            }

            // Add student to group members
            $group->members()->attach($student->id);

            // Add student to project if not already there
            if (!$project->students()->where('users.id', $student->id)->exists()) {
                $project->students()->attach($student->id);
                $project->increment('current_students');

                // Create or update project registration record as approved
                ProjectRegistration::updateOrCreate(
                    [
                        'project_id' => $project->id,
                        'student_id' => $student->id,
                    ],
                    [
                        'status' => 'approved',
                        'submitted_at' => now(),
                        'reviewed_at' => now(),
                        'reviewed_by' => $reviewer->id,
                        'review_comments' => 'Auto-approved by group leader via join request',
                    ]
                );
            }

            // Update request status
            $request->update([
                'status' => 'approved',
                'reviewed_at' => now(),
                'reviewed_by' => $reviewer->id,
            ]);

            return $group->fresh();
        });
    }

    /**
     * Reject a join request
     */
    public function rejectJoinRequest(GroupJoinRequest $request, User $reviewer, ?string $comments = null): void
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
    }
}

