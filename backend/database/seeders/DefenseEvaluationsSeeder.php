<?php

namespace Database\Seeders;

use App\Models\DefenseEvaluation;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class DefenseEvaluationsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates defense evaluations (FD1 and FD2) for projects that have students.
     * Each student receives evaluations from:
     * - Supervisor (evaluator_role: 'supervisor')
     * - Discussion Committee Members (evaluator_role: 'committee_member')
     * - Project Committee Members (evaluator_role: 'project_committee', optional)
     */
    public function run(): void
    {
        // Idempotent: skip if defense evaluations already exist (for re-seeding / testing)
        if (DefenseEvaluation::count() > 0) {
            $this->command->info('تم تخطي تقييمات المناقشة (موجودة مسبقاً) / Defense evaluations already seeded, skipping.');
            return;
        }

        $projectsWithStudents = Project::whereHas('students')
            ->with(['students', 'supervisor', 'discussionCommittee.members', 'projectCommittee.members'])
            ->get();

        $created = 0;
        $fd1Count = 0;
        $fd2Count = 0;

        foreach ($projectsWithStudents as $project) {
            // Get evaluators
            $supervisor = $project->supervisor;
            $discussionMembers = $project->discussionCommittee?->members ?? collect();
            $projectMembers = $project->projectCommittee?->members ?? collect();

            foreach ($project->students as $student) {
                // ========================================
                // FD1 EVALUATIONS
                // ========================================

                // 1. Supervisor evaluation for FD1
                if ($supervisor) {
                    $supervisorScore = (float) fake()->numberBetween(72, 96);
                    DefenseEvaluation::create([
                        'project_id' => $project->id,
                        'student_id' => $student->id,
                        'evaluator_id' => $supervisor->id,
                        'evaluator_role' => 'supervisor',
                        'defense_stage' => 'fd1',
                        'score' => $supervisorScore,
                        'max_score' => 100.00,
                        'criteria' => json_encode([
                            'presentation' => 'عرض تقديمي واضح ومنظم',
                            'technical_knowledge' => 'معرفة تقنية جيدة',
                            'problem_solving' => 'قدرة على حل المشكلات',
                        ]),
                        'notes' => 'أداء جيد في المناقشة. ' . fake()->randomElement([
                            'عرض واضح للأهداف والمنهجية.',
                            'إجابات دقيقة على الأسئلة.',
                            'تحليل جيد للمشكلة والحل المقترح.',
                        ]),
                        'created_by' => $supervisor->id,
                        'modified_by' => null,
                    ]);
                    $created++;
                    $fd1Count++;
                }

                // 2. Discussion committee members evaluations for FD1 (typically 2-3 members)
                foreach ($discussionMembers->take(3) as $member) {
                    $memberScore = (float) fake()->numberBetween(70, 95);
                    DefenseEvaluation::create([
                        'project_id' => $project->id,
                        'student_id' => $student->id,
                        'evaluator_id' => $member->id,
                        'evaluator_role' => 'committee_member',
                        'defense_stage' => 'fd1',
                        'score' => $memberScore,
                        'max_score' => 100.00,
                        'criteria' => json_encode([
                            'research_quality' => 'جودة البحث والمراجع',
                            'methodology' => 'المنهجية المتبعة',
                            'contribution' => 'المساهمة العلمية',
                        ]),
                        'notes' => 'تقييم لجنة المناقشة. ' . fake()->randomElement([
                            'بحث جيد مع مراجع كافية.',
                            'منهجية واضحة ومناسبة.',
                            'مساهمة علمية مقبولة.',
                        ]),
                        'created_by' => $member->id,
                        'modified_by' => null,
                    ]);
                    $created++;
                    $fd1Count++;
                }

                // 3. Project committee members evaluations for FD1 (optional, typically 1-2 members)
                foreach ($projectMembers->take(2) as $member) {
                    $memberScore = (float) fake()->numberBetween(68, 92);
                    DefenseEvaluation::create([
                        'project_id' => $project->id,
                        'student_id' => $student->id,
                        'evaluator_id' => $member->id,
                        'evaluator_role' => 'project_committee',
                        'defense_stage' => 'fd1',
                        'score' => $memberScore,
                        'max_score' => 100.00,
                        'criteria' => json_encode([
                            'project_planning' => 'التخطيط للمشروع',
                            'execution' => 'التنفيذ والجودة',
                            'documentation' => 'التوثيق',
                        ]),
                        'notes' => 'تقييم لجنة المشاريع. ' . fake()->randomElement([
                            'تخطيط جيد للمشروع.',
                            'تنفيذ مناسب وجودة مقبولة.',
                            'توثيق واضح ومفصل.',
                        ]),
                        'created_by' => $member->id,
                        'modified_by' => null,
                    ]);
                    $created++;
                    $fd1Count++;
                }

                // ========================================
                // FD2 EVALUATIONS (Higher scores, representing progress)
                // ========================================

                // 1. Supervisor evaluation for FD2
                if ($supervisor) {
                    $supervisorScore = (float) fake()->numberBetween(75, 98);
                    DefenseEvaluation::create([
                        'project_id' => $project->id,
                        'student_id' => $student->id,
                        'evaluator_id' => $supervisor->id,
                        'evaluator_role' => 'supervisor',
                        'defense_stage' => 'fd2',
                        'score' => $supervisorScore,
                        'max_score' => 100.00,
                        'criteria' => json_encode([
                            'final_presentation' => 'العرض النهائي',
                            'project_completion' => 'اكتمال المشروع',
                            'innovation' => 'الابتكار والتميز',
                        ]),
                        'notes' => 'أداء ممتاز في المناقشة النهائية. ' . fake()->randomElement([
                            'مشروع مكتمل وشامل.',
                            'عرض نهائي احترافي.',
                            'تحسن ملحوظ منذ المرحلة الأولى.',
                        ]),
                        'created_by' => $supervisor->id,
                        'modified_by' => null,
                    ]);
                    $created++;
                    $fd2Count++;
                }

                // 2. Discussion committee members evaluations for FD2
                foreach ($discussionMembers->take(3) as $member) {
                    $memberScore = (float) fake()->numberBetween(73, 97);
                    DefenseEvaluation::create([
                        'project_id' => $project->id,
                        'student_id' => $student->id,
                        'evaluator_id' => $member->id,
                        'evaluator_role' => 'committee_member',
                        'defense_stage' => 'fd2',
                        'score' => $memberScore,
                        'max_score' => 100.00,
                        'criteria' => json_encode([
                            'final_quality' => 'الجودة النهائية',
                            'improvements' => 'التحسينات المطبقة',
                            'overall_assessment' => 'التقييم الشامل',
                        ]),
                        'notes' => 'تقييم نهائي من لجنة المناقشة. ' . fake()->randomElement([
                            'جودة نهائية ممتازة.',
                            'تم تطبيق جميع التحسينات المطلوبة.',
                            'مشروع متميز بشكل عام.',
                        ]),
                        'created_by' => $member->id,
                        'modified_by' => null,
                    ]);
                    $created++;
                    $fd2Count++;
                }

                // 3. Project committee members evaluations for FD2
                foreach ($projectMembers->take(2) as $member) {
                    $memberScore = (float) fake()->numberBetween(71, 95);
                    DefenseEvaluation::create([
                        'project_id' => $project->id,
                        'student_id' => $student->id,
                        'evaluator_id' => $member->id,
                        'evaluator_role' => 'project_committee',
                        'defense_stage' => 'fd2',
                        'score' => $memberScore,
                        'max_score' => 100.00,
                        'criteria' => json_encode([
                            'final_documentation' => 'التوثيق النهائي',
                            'code_quality' => 'جودة الكود',
                            'deployment' => 'النشر والتسليم',
                        ]),
                        'notes' => 'تقييم نهائي من لجنة المشاريع. ' . fake()->randomElement([
                            'توثيق نهائي شامل ومفصل.',
                            'جودة كود ممتازة.',
                            'تسليم نهائي احترافي.',
                        ]),
                        'created_by' => $member->id,
                        'modified_by' => null,
                    ]);
                    $created++;
                    $fd2Count++;
                }
            }
        }

        $this->command->info('تم إنشاء تقييمات المناقشة (عربي) / Created defense evaluations (Arabic):');
        $this->command->info('- المجموع / Total: ' . $created . ' تقييم / evaluation(s)');
        $this->command->info('- تقييمات FD1 / FD1 evaluations: ' . $fd1Count);
        $this->command->info('- تقييمات FD2 / FD2 evaluations: ' . $fd2Count);
    }
}
