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

        // Idempotent: skip if we already have enough demo proposals (for re-seeding / testing)
        $targetCount = 14;
        if (Proposal::count() >= $targetCount) {
            $this->command->info('تم تخطي المقترحات (موجودة مسبقاً) / Proposals already seeded, skipping.');
            return;
        }

        $pending = collect();
        $requiresModification = collect();
        $rejected = collect();
        $reviewer = $projectsCommitteeMembers->first();
        $supervisorList = $supervisors->values()->all();

        // 8 pending_review (Arabic)
        for ($i = 0; $i < 8; $i++) {
            $supervisor = $supervisorList[$i % count($supervisorList)];
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

        // 3 requires_modification (Arabic)
        $modNotes = [
            'يرجى توضيح منهجية التنفيذ والجدول الزمني.',
            'يُنصح بإضافة خطة اختبار وتوثيق للمشروع.',
            'يرجى تحديد الأدوات والتقنيات المستخدمة بشكل أوضح.',
        ];
        for ($i = 0; $i < 3; $i++) {
            $supervisor = $supervisorList[$i % count($supervisorList)];
            $requiresModification->push(Proposal::create([
                'title' => YemeniDataHelper::yemeniProposalTitle(),
                'description' => YemeniDataHelper::yemeniProposalDescription(),
                'submitter_id' => $supervisor->id,
                'proposed_supervisor_id' => $supervisor->id,
                'team_members' => null,
                'status' => ProposalStatus::REQUIRES_MODIFICATION,
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
                'review_notes' => $modNotes[$i],
                'project_id' => null,
                'student_group_id' => null,
                'target_project_id' => null,
            ]));
        }

        // 3 rejected (Arabic)
        $rejectNotes = [
            'المقترح لا يلائم معايير القبول الحالية.',
            'تم رفض المقترح لعدم استكمال المتطلبات.',
            'المشروع مكرر أو قريب من مشروع معتمد سابقاً.',
        ];
        for ($i = 0; $i < 3; $i++) {
            $supervisor = $supervisorList[($i + 2) % count($supervisorList)];
            $rejected->push(Proposal::create([
                'title' => YemeniDataHelper::yemeniProposalTitle(),
                'description' => YemeniDataHelper::yemeniProposalDescription(),
                'submitter_id' => $supervisor->id,
                'proposed_supervisor_id' => $supervisor->id,
                'team_members' => null,
                'status' => ProposalStatus::REJECTED,
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
                'review_notes' => $rejectNotes[$i],
                'project_id' => null,
                'student_group_id' => null,
                'target_project_id' => null,
            ]));
        }

        $total = $pending->count() + $requiresModification->count() + $rejected->count();
        $this->command->info('تم إنشاء المقترحات (عربي) / Created proposals (Arabic):');
        $this->command->info('- ' . $pending->count() . ' قيد المراجعة / pending review');
        $this->command->info('- ' . $requiresModification->count() . ' يتطلب تعديلات / requires modification');
        $this->command->info('- ' . $rejected->count() . ' مرفوض / rejected');
        $this->command->info('المجموع / Total: ' . $total . ' مقترحات / proposals');
    }
}
