<?php

namespace Database\Seeders;

use App\Enums\ProposalStatus;
use App\Enums\ProjectStatus;
use App\Models\DiscussionCommittee;
use App\Models\Project;
use App\Models\ProjectCommittee;
use App\Models\ProjectRegistration;
use App\Models\Proposal;
use App\Models\StudentGroup;
use App\Models\User;
use Database\Seeders\helpers\YemeniDataHelper;
use Illuminate\Database\Seeder;

class ProjectsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates projects (Arabic), links approved proposals, creates student groups.
     */
    public function run(): void
    {
        $supervisors = User::where('role', 'supervisor')->get();
        $students = User::where('role', 'student')->get();
        $projectsCommitteeMembers = User::where('role', 'projects_committee')->get();
        $projectCommittees = ProjectCommittee::all();
        $discussionCommittees = DiscussionCommittee::all();

        if ($supervisors->isEmpty() || $projectCommittees->isEmpty() || $discussionCommittees->isEmpty()) {
            $this->command->warn('Users and committees required. Run UsersSeeder and CommitteesSeeder first.');
            return;
        }

        // Idempotent: skip if we already have enough demo projects (for re-seeding / testing)
        $targetProjects = 12;
        if (Project::count() >= $targetProjects) {
            $this->command->info('تم تخطي المشاريع والمجموعات (موجودة مسبقاً) / Projects & groups already seeded, skipping.');
            return;
        }

        $maxStudents = 3;
        $reviewer = $projectsCommitteeMembers->first();
        $supCount = $supervisors->count();
        $pcCount = $projectCommittees->count();
        $dcCount = $discussionCommittees->count();

        // 1) Create 12 projects with Arabic data and assign supervisors/committees
        $created = [];
        for ($i = 0; $i < $targetProjects; $i++) {
            $title = YemeniDataHelper::yemeniProjectTitle();
            if ($i > 0) {
                $title = $title . ' (' . ($i + 1) . ')';
            }
            $created[] = Project::create([
                'title' => $title,
                'description' => YemeniDataHelper::yemeniProjectDescription(),
                'status' => $i < 2 ? ProjectStatus::IN_PROGRESS->value : ProjectStatus::AVAILABLE_FOR_REGISTRATION->value,
                'supervisor_id' => $supervisors->get($i % $supCount)->id,
                'max_students' => $maxStudents,
                'current_students' => 0,
                'specialization' => YemeniDataHelper::yemeniProjectSpecialization(),
                'project_committee_id' => $projectCommittees->get($i % $pcCount)->id,
                'discussion_committee_id' => $discussionCommittees->get($i % $dcCount)->id,
                'supervisor_approval_status' => 'approved',
                'supervisor_approval_at' => now(),
            ]);
        }
        $created = collect($created);

        // 2) Mark 6 pending proposals as approved and link to projects
        $pendingProposals = Proposal::where('status', ProposalStatus::PENDING_REVIEW)->get();
        foreach ($pendingProposals->take(6) as $index => $proposal) {
            $project = $created->get($index % $created->count());
            $proposal->update([
                'status' => ProposalStatus::APPROVED,
                'project_id' => $project->id,
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
            ]);
        }

        // 3) Create 5 student groups (Arabic names), assign 2 projects to 2 groups
        $groupNames = ['مجموعة النخبة', 'مجموعة الإبداع', 'مجموعة التميز', 'مجموعة الابتكار', 'مجموعة المستقبل'];
        $studentIds = $students->pluck('id')->values()->all();
        $studentsNeeded = 5 * 3; // 5 groups × 3 members
        if (count($studentIds) >= $studentsNeeded) {
            $groups = [];
            for ($gIndex = 0; $gIndex < 5; $gIndex++) {
                $leaderId = $studentIds[$gIndex * 3];
                $memberIds = array_slice($studentIds, $gIndex * 3 + 1, 2);
                $group = StudentGroup::create([
                    'name' => $groupNames[$gIndex],
                    'leader_id' => $leaderId,
                    'status' => 'active',
                ]);
                $group->members()->sync($memberIds);
                $groups[] = $group;
            }

            // Assign first 2 projects to first 2 groups (in_progress with students and registrations)
            for ($p = 0; $p < 2; $p++) {
                $projectForGroup = $created[$p];
                $group = $groups[$p];
                $memberIds = $group->members()->pluck('users.id')->push($group->leader_id)->unique()->values()->all();
                foreach ($memberIds as $sid) {
                    if (!$projectForGroup->students()->where('users.id', $sid)->exists()) {
                        $projectForGroup->students()->attach($sid);
                        ProjectRegistration::updateOrCreate(
                            ['project_id' => $projectForGroup->id, 'student_id' => $sid],
                            ['status' => 'approved', 'submitted_at' => now(), 'reviewed_at' => now(), 'reviewed_by' => $reviewer->id]
                        );
                    }
                }
                $projectForGroup->increment('current_students', count($memberIds));
                $projectForGroup->update([
                    'assigned_group_id' => $group->id,
                    'reserved_at' => now(),
                    'status' => ProjectStatus::IN_PROGRESS->value,
                ]);
            }
        }

        $this->command->info('تم إنشاء المشاريع والمجموعات (عربي) / Created projects & groups (Arabic):');
        $this->command->info('- ' . count($created) . ' مشاريع / projects');
        $this->command->info('- 6 مقترحات معتمدة مرتبطة / proposals approved & linked');
        $this->command->info('- 5 مجموعات طلاب / student groups');
    }
}
