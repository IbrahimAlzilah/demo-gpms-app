<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Resources\GroupResource;
use App\Models\ProjectGroup;
use App\Models\GroupInvitation;
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
        $group = ProjectGroup::whereHas('members', function ($q) use ($request) {
            $q->where('users.id', $request->user()->id);
        })->with(['project', 'leader', 'members'])->first();

        if (!$group) {
            return response()->json([
                'success' => false,
                'message' => 'Group not found',
            ], 404);
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
            $invitee = \App\Models\User::findOrFail($validated['invitee_id']);

            $invitation = $this->groupService->inviteMember(
                $group,
                $request->user(),
                $invitee,
                $validated['message'] ?? null
            );

            return response()->json([
                'success' => true,
                'data' => $invitation,
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
            ->with(['group', 'inviter'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $invitations,
        ]);
    }
}

