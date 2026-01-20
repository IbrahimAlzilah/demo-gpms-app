<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Resources\StudentGroupResource;
use App\Models\StudentGroup;
use App\Models\StudentGroupInvitation;
use App\Models\StudentGroupJoinRequest;
use App\Services\StudentGroupService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentGroupController extends Controller
{
    public function __construct(
        protected StudentGroupService $groupService
    ) {}

    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Get group where user is leader or member
        $group = StudentGroup::where(function ($query) use ($user) {
            $query->where('leader_id', $user->id)
                ->orWhereHas('members', function ($q) use ($user) {
                    $q->where('users.id', $user->id);
                });
        })
        ->where('status', 'active')
        ->with(['leader', 'members'])
        ->first();

        if (!$group) {
            return response()->json([
                'success' => true,
                'data' => null,
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => new StudentGroupResource($group),
        ]);
    }

    public function findByCode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string',
        ]);

        $group = StudentGroup::where('group_code', $validated['code'])
            ->where('status', 'active')
            ->with(['leader', 'members'])
            ->first();

        if (!$group) {
            return response()->json([
                'success' => false,
                'message' => 'Group not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new StudentGroupResource($group),
        ]);
    }

    public function create(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'member_ids' => 'nullable|array',
            'member_ids.*' => 'exists:users,id',
        ]);

        try {
            $group = $this->groupService->create(
                $request->user(),
                $validated['name'] ?? null,
                $validated['member_ids'] ?? []
            );

            return response()->json([
                'success' => true,
                'data' => new StudentGroupResource($group->load(['leader', 'members'])),
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
            'group_id' => 'required|exists:student_groups,id',
            'invitee_id' => 'required|exists:users,id',
            'message' => 'nullable|string',
        ]);

        try {
            $group = StudentGroup::findOrFail($validated['group_id']);
            
            // Verify user is leader
            if ($group->leader_id !== $request->user()->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only the group leader can invite members',
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
                'data' => $invitation->load(['group', 'inviter', 'invitee']),
                'message' => 'Invitation sent successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function acceptInvitation(Request $request, StudentGroupInvitation $invitation): JsonResponse
    {
        try {
            $group = $this->groupService->acceptInvitation($invitation, $request->user());

            return response()->json([
                'success' => true,
                'data' => new StudentGroupResource($group->load(['leader', 'members'])),
                'message' => 'Invitation accepted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function rejectInvitation(Request $request, StudentGroupInvitation $invitation): JsonResponse
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
        $invitations = StudentGroupInvitation::where('invitee_id', $request->user()->id)
            ->where('status', 'pending')
            ->with(['group', 'inviter', 'invitee'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $invitations,
        ]);
    }

    public function updateLeader(Request $request, StudentGroup $group): JsonResponse
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
                'data' => new StudentGroupResource($updatedGroup->load(['leader', 'members'])),
                'message' => 'Leader updated successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function addMember(Request $request, StudentGroup $group): JsonResponse
    {
        // Verify user is leader
        if ($group->leader_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Only the group leader can add members',
            ], 403);
        }

        $validated = $request->validate([
            'member_id' => 'required|exists:users,id',
        ]);

        try {
            $member = \App\Models\User::findOrFail($validated['member_id']);

            $updatedGroup = $this->groupService->addMember($group, $member);

            return response()->json([
                'success' => true,
                'data' => new StudentGroupResource($updatedGroup->load(['leader', 'members'])),
                'message' => 'Member added successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function removeMember(Request $request, StudentGroup $group, \App\Models\User $member): JsonResponse
    {
        // Verify user is leader
        if ($group->leader_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Only the leader can remove members',
            ], 403);
        }

        try {
            $updatedGroup = $this->groupService->removeMember($group, $member);

            return response()->json([
                'success' => true,
                'data' => new StudentGroupResource($updatedGroup->load(['leader', 'members'])),
                'message' => 'Member removed successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function createJoinRequest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'group_id' => 'required|exists:student_groups,id',
            'message' => 'nullable|string|max:500',
        ]);

        try {
            $group = StudentGroup::findOrFail($validated['group_id']);
            $joinRequest = $this->groupService->createJoinRequest(
                $group,
                $request->user(),
                $validated['message'] ?? null
            );

            return response()->json([
                'success' => true,
                'data' => $joinRequest->load(['group', 'student']),
                'message' => 'Join request submitted successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function getJoinRequests(Request $request, StudentGroup $group): JsonResponse
    {
        // Verify user is the group leader
        if ($group->leader_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Only the group leader can view join requests',
            ], 403);
        }

        $joinRequests = StudentGroupJoinRequest::where('group_id', $group->id)
            ->with(['student', 'reviewer'])
            ->orderBy('requested_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $joinRequests,
        ]);
    }

    public function approveJoinRequest(Request $request, StudentGroupJoinRequest $joinRequest): JsonResponse
    {
        try {
            $group = $this->groupService->approveJoinRequest($joinRequest, $request->user());

            return response()->json([
                'success' => true,
                'data' => new StudentGroupResource($group->load(['leader', 'members'])),
                'message' => 'Join request approved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function rejectJoinRequest(Request $request, StudentGroupJoinRequest $joinRequest): JsonResponse
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
