<?php

namespace App\Http\Controllers\ProjectsCommittee;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Http\Resources\UserResource;
use App\Models\Project;
use App\Models\CommitteeAssignment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommitteeController extends Controller
{
    public function distribute(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'assignments' => 'required|array',
            'assignments.*.project_id' => 'required|exists:projects,id',
            'assignments.*.committee_member_ids' => 'required|array|min:2|max:3',
            'assignments.*.committee_member_ids.*' => 'exists:users,id',
        ]);

        try {
            $projects = [];
            foreach ($validated['assignments'] as $assignment) {
                $project = Project::findOrFail($assignment['project_id']);
                
                // Remove existing assignments
                CommitteeAssignment::where('project_id', $project->id)->delete();
                
                // Create new assignments
                foreach ($assignment['committee_member_ids'] as $memberId) {
                    CommitteeAssignment::create([
                        'project_id' => $project->id,
                        'committee_member_id' => $memberId,
                    ]);
                }

                $projects[] = $project->fresh()->load(['supervisor', 'students', 'committeeMembers']);
            }

            return response()->json([
                'success' => true,
                'data' => ProjectResource::collection($projects),
                'message' => 'Committees distributed successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function members(Request $request): JsonResponse
    {
        $members = User::where('role', 'discussion_committee')
            ->where('status', 'active')
            ->get();

        return response()->json([
            'success' => true,
            'data' => UserResource::collection($members),
        ]);
    }
}

