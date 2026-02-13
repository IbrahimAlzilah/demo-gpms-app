<?php

namespace Database\Seeders;

use App\Models\DiscussionCommittee;
use App\Models\ProjectCommittee;
use App\Models\User;
use Illuminate\Database\Seeder;

class CommitteesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create project committees (only if we don't have enough)
        $existingProjectCommitteesCount = ProjectCommittee::count();
        $projectCommitteesToCreate = max(0, 2 - $existingProjectCommitteesCount);
        $projectCommittees = collect();
        if ($projectCommitteesToCreate > 0) {
            $projectCommittees = ProjectCommittee::factory()
                ->count($projectCommitteesToCreate)
                ->create();
        }
        // Get all project committees (existing + newly created)
        $projectCommittees = ProjectCommittee::all();

        // Attach members to project committees (only if not already attached)
        $projectsCommitteeMembers = User::where('role', 'projects_committee')->get();
        if ($projectsCommitteeMembers->isNotEmpty() && $projectCommittees->isNotEmpty()) {
            // Distribute members evenly across committees (1 member per committee with 2 committees and 2 members)
            $membersPerCommittee = max(1, (int) floor($projectsCommitteeMembers->count() / $projectCommittees->count()));
            foreach ($projectCommittees as $index => $committee) {
                $startIndex = $index * $membersPerCommittee;
                $members = $projectsCommitteeMembers->skip($startIndex)->take($membersPerCommittee);
                $existingMemberIds = $committee->members()->pluck('users.id')->toArray();
                $newMemberIds = $members->pluck('id')->diff($existingMemberIds)->toArray();
                if (!empty($newMemberIds)) {
                    $committee->members()->attach($newMemberIds);
                }
            }
        }

        // Create discussion committees (2 committees for 4 members: 2 members each)
        $existingDiscussionCommitteesCount = DiscussionCommittee::count();
        $discussionCommitteesToCreate = max(0, 2 - $existingDiscussionCommitteesCount);
        $discussionCommittees = collect();
        if ($discussionCommitteesToCreate > 0) {
            $discussionCommittees = DiscussionCommittee::factory()
                ->count($discussionCommitteesToCreate)
                ->create();
        }
        // Get all discussion committees (existing + newly created)
        $discussionCommittees = DiscussionCommittee::all();

        // Attach members to discussion committees (distribute 4 members across 2 committees)
        $discussionCommitteeMembers = User::where('role', 'discussion_committee')->get();
        if ($discussionCommitteeMembers->isNotEmpty() && $discussionCommittees->isNotEmpty()) {
            $membersPerCommittee = max(1, (int) floor($discussionCommitteeMembers->count() / $discussionCommittees->count()));
            foreach ($discussionCommittees as $index => $committee) {
                $startIndex = $index * $membersPerCommittee;
                $members = $discussionCommitteeMembers->skip($startIndex)->take($membersPerCommittee);
                $existingMemberIds = $committee->members()->pluck('users.id')->toArray();
                $newMemberIds = $members->pluck('id')->diff($existingMemberIds)->toArray();
                if (!empty($newMemberIds)) {
                    $committee->members()->attach($newMemberIds);
                }
            }
        }

        $this->command->info('تم إنشاء اللجان (بيانات عربية) / Created committees (Arabic):');
        $this->command->info('- ' . count($projectCommittees) . ' لجنة مشاريع / project committees');
        $this->command->info('- ' . count($discussionCommittees) . ' لجنة مناقشة / discussion committees');
    }
}
