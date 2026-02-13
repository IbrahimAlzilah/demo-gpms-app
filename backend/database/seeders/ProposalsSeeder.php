<?php

namespace Database\Seeders;

use App\Enums\ProposalStatus;
use App\Models\Proposal;
use App\Models\User;
use Database\Seeders\helpers\YemeniDataHelper;
use Illuminate\Database\Seeder;

class ProposalsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates demo proposals (all Arabic) in mixed statuses for committee workflow.
     */
    public function run(): void
    {
        $supervisors = User::where('role', 'supervisor')->get();
        $projectsCommitteeMembers = User::where('role', 'projects_committee')->get();

        if ($supervisors->isEmpty() || $projectsCommitteeMembers->isEmpty()) {
            $this->command->warn('Not enough users to create proposals. Ensure UsersSeeder runs first.');
            return;
        }

        // Idempotent: skip if we already have demo proposals (for re-seeding / testing)
        if (Proposal::count() >= 5) {
            $this->command->info('تم تخطي المقترحات (موجودة مسبقاً) / Proposals already seeded, skipping.');
            return;
        }

        $pending = collect();
        $requiresModification = collect();

        // 5 supervisor-submitted proposals: 4 pending_review, 1 requires_modification (Arabic)
        $submitters = $supervisors->take(5);
        $reviewer = $projectsCommitteeMembers->first();

        foreach ($submitters->take(4) as $supervisor) {
            $pending->push(Proposal::create([
                'title' => YemeniDataHelper::yemeniProposalTitle(),
                'description' => YemeniDataHelper::yemeniProposalDescription(),
                'submitter_id' => $supervisor->id,
                'proposed_supervisor_id' => $supervisor->id,
                'team_members' => null,
                'status' => ProposalStatus::PENDING_REVIEW,
                'reviewed_by' => null,
                'reviewed_at' => null,
                'review_notes' => null,
                'project_id' => null,
                'student_group_id' => null,
                'target_project_id' => null,
            ]));
        }

        $lastSupervisor = $submitters->get(4);
        if ($lastSupervisor) {
            $requiresModification->push(Proposal::create([
                'title' => YemeniDataHelper::yemeniProposalTitle(),
                'description' => YemeniDataHelper::yemeniProposalDescription(),
                'submitter_id' => $lastSupervisor->id,
                'proposed_supervisor_id' => $lastSupervisor->id,
                'team_members' => null,
                'status' => ProposalStatus::REQUIRES_MODIFICATION,
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
                'review_notes' => 'يرجى توضيح منهجية التنفيذ والجدول الزمني.',
                'project_id' => null,
                'student_group_id' => null,
                'target_project_id' => null,
            ]));
        }

        $this->command->info('تم إنشاء المقترحات (عربي) / Created proposals (Arabic):');
        $this->command->info('- ' . $pending->count() . ' قيد المراجعة / pending review');
        $this->command->info('- ' . $requiresModification->count() . ' يتطلب تعديلات / requires modification');
        $this->command->info('المجموع / Total: ' . ($pending->count() + $requiresModification->count()) . ' مقترحات / proposals');
    }
}
