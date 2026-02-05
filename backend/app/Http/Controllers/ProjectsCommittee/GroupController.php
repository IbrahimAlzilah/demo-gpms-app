<?php

namespace App\Http\Controllers\ProjectsCommittee;

use App\Http\Controllers\Controller;
use App\Http\Resources\StudentGroupResource;
use App\Http\Resources\UserResource;
use App\Models\StudentGroup;
use App\Models\User;
use App\Services\StudentGroupService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GroupController extends Controller
{
    public function __construct(
        protected StudentGroupService $groupService
    ) {}

    /**
     * Show a single group (for committee management)
     */
    public function show(StudentGroup $group): JsonResponse
    {
        $group->load(['leader', 'members', 'assignedProjects.supervisor']);

        return response()->json([
            'success' => true,
            'data' => new StudentGroupResource($group),
        ]);
    }

    /**
     * Add a member to the group
     */
    public function addMember(Request $request, StudentGroup $group): JsonResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:users,id',
        ]);

        $student = User::findOrFail($validated['student_id']);

        try {
            $group = $this->groupService->addMemberByCommittee($group, $student);

            return response()->json([
                'success' => true,
                'data' => new StudentGroupResource($group),
                'message' => __('Member added to group successfully'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Remove a member from the group
     */
    public function removeMember(StudentGroup $group, User $member): JsonResponse
    {
        try {
            $group = $this->groupService->removeMemberByCommittee($group, $member);

            return response()->json([
                'success' => true,
                'data' => new StudentGroupResource($group),
                'message' => __('Member removed from group successfully'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Update group (e.g. name)
     */
    public function update(Request $request, StudentGroup $group): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|nullable|string|max:255',
        ]);

        try {
            $group = $this->groupService->updateGroupByCommittee($group, $validated);

            return response()->json([
                'success' => true,
                'data' => new StudentGroupResource($group),
                'message' => __('Group updated successfully'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * List students not in any active group (eligible to be added to a group)
     */
    public function eligibleStudents(Request $request): JsonResponse
    {
        $query = User::where('role', 'student')
            ->where('status', 'active')
            ->orderBy('name');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $students = $query->get()->filter(function (User $user) {
            return !StudentGroup::where('status', 'active')
                ->where(function ($q) use ($user) {
                    $q->where('leader_id', $user->id)
                        ->orWhereHas('members', fn ($m) => $m->where('users.id', $user->id));
                })
                ->exists();
        })->values();

        return response()->json([
            'success' => true,
            'data' => UserResource::collection($students),
        ]);
    }
}

