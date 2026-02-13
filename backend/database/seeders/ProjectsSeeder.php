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

        // Idempotent: skip if we already have demo projects (for re-seeding / testing)
        if (Project::count() >= 5) {
            $this->command->info('تم تخطي المشاريع والمجموعات (موجودة مسبقاً) / Projects & groups already seeded, skipping.');
            return;
        }

        $maxStudents = 3;
        $reviewer = $projectsCommitteeMembers->first();

        // 1) Create projects with Arabic data and assign supervisors/committees
        $created = [];
        for ($i = 0; $i < 5; $i++) {
            $title = YemeniDataHelper::yemeniProjectTitle();
            if ($i > 0) {
                $title = $title . ' (' . ($i + 1) . ')';
            }
            $supervisor = $supervisors->get($i % $supervisors->count());
            $pc = $projectCommittees->get($i % $projectCommittees->count());
            $dc = $discussionCommittees->get($i % $discussionCommittees->count());
            $created[] = Project::create([
                'title' => $title,
                'description' => YemeniDataHelper::yemeniProjectDescription(),
                'status' => $i === 0 ? ProjectStatus::IN_PROGRESS->value : ProjectStatus::AVAILABLE_FOR_REGISTRATION->value,
                'supervisor_id' => $supervisor->id,
                'max_students' => $maxStudents,
                'current_students' => 0,
                'specialization' => YemeniDataHelper::yemeniProjectSpecialization(),
                'project_committee_id' => $pc->id,
                'discussion_committee_id' => $dc->id,
                'supervisor_approval_status' => 'approved',
                'supervisor_approval_at' => now(),
            ]);
        }
        $created = collect($created);

        // 2) Mark some pending proposals as approved and link to these projects
        $pendingProposals = Proposal::where('status', ProposalStatus::PENDING_REVIEW)->get();
        foreach ($pendingProposals->take(3) as $index => $proposal) {
            $project = $created[$index] ?? $created[0];
            $proposal->update([
                'status' => ProposalStatus::APPROVED,
                'project_id' => $project->id,
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
            ]);
        }

        // 3) Create student groups (Arabic names) and assign one project to one group
        $groupNames = ['مجموعة النخبة', 'مجموعة الإبداع'];
        $studentIds = $students->pluck('id')->values()->all();
        if (count($studentIds) >= 6) {
            $groups = [];
            foreach ($groupNames as $gIndex => $name) {
                $leaderId = $studentIds[$gIndex * 3];
                $memberIds = array_slice($studentIds, $gIndex * 3 + 1, 2);
                $group = StudentGroup::create([
                    'name' => $name,
                    'leader_id' => $leaderId,
                    'status' => 'active',
                ]);
                $group->members()->sync($memberIds);
                $groups[] = $group;
            }

            // Assign first project to first group: attach students, set assigned_group_id, registrations
            $projectForGroup = $created[0];
            $group = $groups[0];
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

        $this->command->info('تم إنشاء المشاريع والمجموعات (عربي) / Created projects & groups (Arabic):');
        $this->command->info('- ' . count($created) . ' مشاريع / projects');
        $this->command->info('- 3 مقترحات معتمدة مرتبطة / proposals approved & linked');
        $this->command->info('- 2 مجموعات طلاب / student groups');
    }
}
