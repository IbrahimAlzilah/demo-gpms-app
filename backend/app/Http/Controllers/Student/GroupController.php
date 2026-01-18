<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Resources\GroupResource;
use App\Models\ProjectGroup;
use App\Models\GroupInvitation;
use App\Models\GroupJoinRequest;
use App\Services\GroupService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GroupController extends Controller
{
    public function __construct(
        protected GroupService $groupService
    ) {}

    public function show(Request $request): JsonResponse
    {
        $query = ProjectGroup::with(['project', 'leader', 'members']);

        // If project_id is provided in query, filter by project
        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        } else {
            // Otherwise, get group where user is a member
            $query->whereHas('members', function ($q) use ($request) {
                $q->where('users.id', $request->user()->id);
            });
        }

        $group = $query->first();

        // Return 200 with null data when no group exists (graceful handling for frontend)
        if (!$group) {
            return response()->json([
                'success' => true,
                'data' => null,
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => new GroupResource($group),
        ]);
    }

    public function create(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'member_ids' => 'nullable|array',
            'member_ids.*' => 'exists:users,id',
        ]);

        try {
            $project = \App\Models\Project::findOrFail($validated['project_id']);
            $group = $this->groupService->create(
                $project,
                $request->user(),
                $validated['member_ids'] ?? []
            );

            return response()->json([
                'success' => true,
                'data' => new GroupResource($group->load(['project', 'leader', 'members'])),
                'message' => 'Group created successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function invite(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'group_id' => 'required|exists:project_groups,id',
            'invitee_id' => 'required|exists:users,id',
            'message' => 'nullable|string',
        ]);

        try {
            $group = ProjectGroup::findOrFail($validated['group_id']);
            
            // Verify user is leader or member of the group
            if ($group->leader_id !== $request->user()->id && !$group->hasMember($request->user()->id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to invite members. Only group leader or members can send invitations.',
                ], 403);
            }

            $invitee = \App\Models\User::findOrFail($validated['invitee_id']);

            $invitation = $this->groupService->inviteMember(
                $group,
                $request->user(),
                $invitee,
                $validated['message'] ?? null
            );

            return response()->json([
                'success' => true,
                'data' => new \App\Http\Resources\GroupInvitationResource($invitation->load(['group', 'inviter', 'invitee'])),
                'message' => 'Invitation sent successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function acceptInvitation(Request $request, GroupInvitation $invitation): JsonResponse
    {
        try {
            $group = $this->groupService->acceptInvitation($invitation, $request->user());

            return response()->json([
                'success' => true,
                'data' => new GroupResource($group->load(['project', 'leader', 'members'])),
                'message' => 'Invitation accepted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function rejectInvitation(Request $request, GroupInvitation $invitation): JsonResponse
    {
        try {
            $this->groupService->rejectInvitation($invitation, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'Invitation rejected',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function getInvitations(Request $request): JsonResponse
    {
        $invitations = GroupInvitation::where('invitee_id', $request->user()->id)
            ->where('status', 'pending')
            ->with(['group', 'inviter', 'invitee'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => \App\Http\Resources\GroupInvitationResource::collection($invitations),
        ]);
    }

    /**
     * Update group leader
     * PUT /student/groups/{group}/leader
     */
    public function updateLeader(Request $request, ProjectGroup $group): JsonResponse
    {
        // Verify user is the current leader or a member
        if ($group->leader_id !== $request->user()->id && !$group->hasMember($request->user()->id)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to update leader',
            ], 403);
        }

        $validated = $request->validate([
            'leader_id' => 'required|exists:users,id',
        ]);

        try {
            $newLeader = \App\Models\User::findOrFail($validated['leader_id']);
            
            // Verify new leader is a member of the group
            if (!$group->hasMember($newLeader->id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'New leader must be a member of the group',
                ], 400);
            }

            $updatedGroup = $this->groupService->updateLeader($group, $newLeader);

            return response()->json([
                'success' => true,
                'data' => new GroupResource($updatedGroup->load(['project', 'leader', 'members'])),
                'message' => 'Leader updated successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Add member to group
     * POST /student/groups/{group}/members
     */
    public function addMember(Request $request, ProjectGroup $group): JsonResponse
    {
        // Verify user is leader or member
        if ($group->leader_id !== $request->user()->id && !$group->hasMember($request->user()->id)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to add members',
            ], 403);
        }

        $validated = $request->validate([
            'member_id' => 'required|exists:users,id',
        ]);

        try {
            if ($group->isFull()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Group is full',
                ], 400);
            }

            $member = \App\Models\User::findOrFail($validated['member_id']);

            if ($group->hasMember($member->id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'User is already a member of this group',
                ], 400);
            }

            $updatedGroup = $this->groupService->addMember($group, $member);

            return response()->json([
                'success' => true,
                'data' => new GroupResource($updatedGroup->load(['project', 'leader', 'members'])),
                'message' => 'Member added successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Remove member from group
     * DELETE /student/groups/{group}/members/{member}
     */
    public function removeMember(Request $request, ProjectGroup $group, \App\Models\User $member): JsonResponse
    {
        // Verify user is leader
        if ($group->leader_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Only the leader can remove members',
            ], 403);
        }

        try {
            if (!$group->hasMember($member->id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'User is not a member of this group',
                ], 400);
            }

            // Cannot remove the leader
            if ($group->leader_id === $member->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot remove the leader. Update leader first.',
                ], 400);
            }

            $updatedGroup = $this->groupService->removeMember($group, $member);

            return response()->json([
                'success' => true,
                'data' => new GroupResource($updatedGroup->load(['project', 'leader', 'members'])),
                'message' => 'Member removed successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Create a join request for a group by Group ID
     * POST /student/groups/join-request
     */
    public function createJoinRequest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'group_id' => 'required|exists:project_groups,id',
            'message' => 'nullable|string|max:500',
        ]);

        try {
            $group = ProjectGroup::findOrFail($validated['group_id']);
            $joinRequest = $this->groupService->createJoinRequest(
                $group,
                $request->user(),
                $validated['message'] ?? null
            );

            return response()->json([
                'success' => true,
                'data' => new \App\Http\Resources\GroupJoinRequestResource($joinRequest->load(['group', 'student'])),
                'message' => 'Join request submitted successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get join requests for a group (leader only)
     * GET /student/groups/{group}/join-requests
     */
    public function getJoinRequests(Request $request, ProjectGroup $group): JsonResponse
    {
        // Verify user is the group leader
        if ($group->leader_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Only the group leader can view join requests',
            ], 403);
        }

        $joinRequests = GroupJoinRequest::where('group_id', $group->id)
            ->with(['student', 'reviewer'])
            ->orderBy('requested_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => \App\Http\Resources\GroupJoinRequestResource::collection($joinRequests),
        ]);
    }

    /**
     * Approve a join request
     * POST /student/groups/join-requests/{request}/approve
     */
    public function approveJoinRequest(Request $request, GroupJoinRequest $joinRequest): JsonResponse
    {
        try {
            $group = $this->groupService->approveJoinRequest($joinRequest, $request->user());

            return response()->json([
                'success' => true,
                'data' => new GroupResource($group->load(['project', 'leader', 'members'])),
                'message' => 'Join request approved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Reject a join request
     * POST /student/groups/join-requests/{request}/reject
     */
    public function rejectJoinRequest(Request $request, GroupJoinRequest $joinRequest): JsonResponse
    {
        $validated = $request->validate([
            'comments' => 'nullable|string|max:500',
        ]);

        try {
            $this->groupService->rejectJoinRequest(
                $joinRequest,
                $request->user(),
                $validated['comments'] ?? null
            );

            return response()->json([
                'success' => true,
                'message' => 'Join request rejected',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}

