<?php

namespace Database\Seeders;

use App\Models\Grade;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class GradesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates demo grades (Arabic comments) for projects that have students — for testing grades list & evaluation flows.
     */
    public function run(): void
    {
        // Idempotent: skip if grades already exist (for re-seeding / testing)
        if (Grade::count() > 0) {
            $this->command->info('تم تخطي الدرجات (موجودة مسبقاً) / Grades already seeded, skipping.');
            return;
        }

        $projectsWithStudents = Project::whereHas('students')->with('students')->get();
        $projectsCommitteeMembers = User::where('role', 'projects_committee')->get();
        $approver = $projectsCommitteeMembers->first();

        $created = 0;
        foreach ($projectsWithStudents as $project) {
            foreach ($project->students as $student) {
                $supervisorScore = (float) fake()->numberBetween(70, 95);
                $committeeScore = (float) min(100, max(0, $supervisorScore + fake()->numberBetween(-3, 3)));
                $maxScore = 100.0;
                $finalGrade = round(($supervisorScore + $committeeScore) / 2, 2);
                $comments = 'أداء جيد في المشروع. ' . fake()->randomElement([
                    'التزام واضح بالمواعيد.',
                    'جهد مميز في التصميم والتنفيذ.',
                    'عرض تقديمي منظم.',
                ]);

                Grade::create([
                    'project_id' => $project->id,
                    'student_id' => $student->id,
                    'supervisor_grade' => [
                        'score' => $supervisorScore,
                        'maxScore' => $maxScore,
                        'criteria' => 'تقييم المشرف',
                        'comments' => $comments,
                        'evaluatedAt' => now()->toISOString(),
                        'evaluatedBy' => $project->supervisor_id,
                    ],
                    'committee_grade' => [
                        'score' => $committeeScore,
                        'maxScore' => $maxScore,
                        'criteria' => 'تقييم اللجنة',
                        'comments' => $comments,
                        'evaluatedAt' => now()->toISOString(),
                        'evaluatedBy' => $approver?->id,
                        'committeeMembers' => $projectsCommitteeMembers->pluck('id')->map(fn ($id) => (string) $id)->values()->all(),
                    ],
                    'final_grade' => $finalGrade,
                    'is_approved' => false,
                    'approved_at' => null,
                    'approved_by' => null,
                ]);
                $created++;
            }
        }

        $this->command->info('تم إنشاء الدرجات (عربي) / Created grades (Arabic):');
        $this->command->info('- ' . $created . ' سجل درجة / grade record(s)');
    }
}
