<?php

namespace Database\Seeders;

use App\Models\DefenseApproval;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class DefenseApprovalsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates defense approval records (FD1 and FD2) for projects that have students.
     * Defense approvals track the workflow: pending → approved → published.
     * - FD1: Some approved, some published (for testing)
     * - FD2: All pending (for testing approval workflow)
     */
    public function run(): void
    {
        // Idempotent: skip if defense approvals already exist (for re-seeding / testing)
        if (DefenseApproval::count() > 0) {
            $this->command->info('تم تخطي اعتمادات المناقشة (موجودة مسبقاً) / Defense approvals already seeded, skipping.');
            return;
        }

        $projectsWithStudents = Project::whereHas('students')->get();
        $projectsCommitteeMembers = User::where('role', 'projects_committee')->get();
        $approver = $projectsCommitteeMembers->first();

        if (!$approver) {
            $this->command->warn('No projects committee member found. Skipping defense approvals.');
            return;
        }

        $created = 0;
        $fd1Pending = 0;
        $fd1Approved = 0;
        $fd1Published = 0;
        $fd2Pending = 0;

        foreach ($projectsWithStudents as $project) {
            // ========================================
            // FD1 APPROVAL
            // ========================================
            // Vary the status for testing:
            // - 40% pending (evaluations in progress)
            // - 30% approved (evaluations done, grades can be edited)
            // - 30% published (grades locked, students can view)
            
            $fd1Status = fake()->randomElement([
                'pending',    // 40% - evaluations still being entered
                'approved',   // 30% - evaluations complete, ready to publish
                'published',  // 30% - grades published to students
            ]);

            $fd1ApprovalData = [
                'project_id' => $project->id,
                'defense_stage' => 'fd1',
                'status' => $fd1Status,
                'notes' => null,
                'evaluations_ready_notified_at' => $fd1Status !== 'pending' ? now()->subDays(rand(1, 5)) : null,
            ];

            if ($fd1Status === 'approved' || $fd1Status === 'published') {
                $fd1ApprovalData['approved_by'] = $approver->id;
                $fd1ApprovalData['approved_at'] = now()->subDays(rand(1, 3));
                $fd1ApprovalData['notes'] = 'تم اعتماد تقييمات المرحلة الأولى. جميع الدرجات مراجعة ومعتمدة.';
                $fd1Approved++;
            } else {
                $fd1Pending++;
            }

            if ($fd1Status === 'published') {
                $fd1ApprovalData['published_by'] = $approver->id;
                $fd1ApprovalData['published_at'] = now()->subDays(rand(0, 2));
                $fd1Published++;
            }

            DefenseApproval::create($fd1ApprovalData);
            $created++;

            // ========================================
            // FD2 APPROVAL
            // ========================================
            // All FD2 approvals are pending (for testing approval workflow)
            // This allows testing the complete approval flow in the UI
            
            $fd2ApprovalData = [
                'project_id' => $project->id,
                'defense_stage' => 'fd2',
                'status' => 'pending',
                'approved_by' => null,
                'approved_at' => null,
                'published_by' => null,
                'published_at' => null,
                'notes' => null,
                'evaluations_ready_notified_at' => null, // Not yet ready
            ];

            DefenseApproval::create($fd2ApprovalData);
            $created++;
            $fd2Pending++;
        }

        $this->command->info('تم إنشاء اعتمادات المناقشة (عربي) / Created defense approvals (Arabic):');
        $this->command->info('- المجموع / Total: ' . $created . ' اعتماد / approval(s)');
        $this->command->info('- FD1 قيد الانتظار / FD1 pending: ' . $fd1Pending);
        $this->command->info('- FD1 معتمدة / FD1 approved: ' . $fd1Approved);
        $this->command->info('- FD1 منشورة / FD1 published: ' . $fd1Published);
        $this->command->info('- FD2 قيد الانتظار / FD2 pending: ' . $fd2Pending . ' (جميعها للاختبار / all for testing)');
    }
}
