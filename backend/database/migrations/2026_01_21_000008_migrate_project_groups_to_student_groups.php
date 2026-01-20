<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Migrate project_groups to student_groups
        $projectGroups = DB::table('project_groups')->get();
        
        foreach ($projectGroups as $projectGroup) {
            // Create student group
            $studentGroupId = DB::table('student_groups')->insertGetId([
                'name' => DB::table('project_groups')->where('id', $projectGroup->id)->value('group_name'),
                'leader_id' => $projectGroup->leader_id,
                'status' => 'active',
                'created_at' => $projectGroup->created_at,
                'updated_at' => $projectGroup->updated_at,
            ]);
            
            // Migrate group members
            $members = DB::table('project_group_member')
                ->where('group_id', $projectGroup->id)
                ->get();
            
            foreach ($members as $member) {
                DB::table('student_group_members')->insert([
                    'group_id' => $studentGroupId,
                    'student_id' => $member->member_id,
                    'created_at' => $member->created_at,
                    'updated_at' => $member->updated_at,
                ]);
            }
            
            // Update project with assigned group
            DB::table('projects')
                ->where('id', $projectGroup->project_id)
                ->update([
                    'assigned_group_id' => $studentGroupId,
                    'reserved_at' => $projectGroup->created_at,
                ]);
            
            // Migrate invitations
            $invitations = DB::table('group_invitations')
                ->where('group_id', $projectGroup->id)
                ->get();
            
            foreach ($invitations as $invitation) {
                DB::table('student_group_invitations')->insert([
                    'group_id' => $studentGroupId,
                    'inviter_id' => $invitation->inviter_id,
                    'invitee_id' => $invitation->invitee_id,
                    'status' => $invitation->status,
                    'message' => $invitation->message,
                    'created_at' => $invitation->created_at,
                    'updated_at' => $invitation->updated_at,
                ]);
            }
            
            // Migrate join requests
            $joinRequests = DB::table('group_join_requests')
                ->where('group_id', $projectGroup->id)
                ->get();
            
            foreach ($joinRequests as $joinRequest) {
                DB::table('student_group_join_requests')->insert([
                    'group_id' => $studentGroupId,
                    'student_id' => $joinRequest->student_id,
                    'status' => $joinRequest->status,
                    'message' => $joinRequest->message,
                    'requested_at' => $joinRequest->requested_at,
                    'reviewed_at' => $joinRequest->reviewed_at,
                    'reviewed_by' => $joinRequest->reviewed_by,
                    'review_comments' => $joinRequest->review_comments,
                    'created_at' => $joinRequest->created_at,
                    'updated_at' => $joinRequest->updated_at,
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration is one-way for data migration
        // The old tables will be kept for reference
    }
};
