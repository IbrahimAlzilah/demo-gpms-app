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
     * Includes FD1/FD2 defense grades based on defense evaluation workflow.
     * FD1 formula: 40% supervisor + 60% committee (or 40/40/20 with project committee).
     * FD2 formula: Same as FD1.
     */
    public function run(): void
    {
        // Idempotent: skip if grades already exist (for re-seeding / testing)
        if (Grade::count() > 0) {
            $this->command->info('تم تخطي الدرجات (موجودة مسبقاً) / Grades already seeded, skipping.');
            return;
        }

        $projectsWithStudents = Project::whereHas('students')->with('students', 'projectCommittee')->get();
        $projectsCommitteeMembers = User::where('role', 'projects_committee')->get();
        $approver = $projectsCommitteeMembers->first();

        $created = 0;
        $fd1Grades = 0;
        $fd2Grades = 0;
        
        foreach ($projectsWithStudents as $project) {
            foreach ($project->students as $student) {
                // Legacy supervisor/committee grades (for backward compatibility)
                $supervisorScore = (float) fake()->numberBetween(70, 95);
                $committeeScore = (float) min(100, max(0, $supervisorScore + fake()->numberBetween(-3, 3)));
                $maxScore = 100.0;
                $finalGrade = round(($supervisorScore + $committeeScore) / 2, 2);
                $comments = 'أداء جيد في المشروع. ' . fake()->randomElement([
                    'التزام واضح بالمواعيد.',
                    'جهد مميز في التصميم والتنفيذ.',
                    'عرض تقديمي منظم.',
                ]);

                // FD1 Defense Grades (based on defense evaluation workflow)
                // Supervisor: 40%, Discussion Committee: 60% (or 40/40/20 with project committee)
                $fd1SupervisorScore = (float) fake()->numberBetween(72, 96);
                $fd1DiscussionCommitteeScore = (float) min(100, max(0, $fd1SupervisorScore + fake()->numberBetween(-4, 4)));
                $fd1ProjectCommitteeScore = null;
                
                // Calculate FD1 final grade
                if ($project->projectCommittee) {
                    // With project committee: 40% supervisor + 40% discussion committee + 20% project committee
                    $fd1ProjectCommitteeScore = (float) min(100, max(0, $fd1SupervisorScore + fake()->numberBetween(-2, 2)));
                    $fd1FinalGrade = round(
                        ($fd1SupervisorScore * 0.4) + 
                        ($fd1DiscussionCommitteeScore * 0.4) + 
                        ($fd1ProjectCommitteeScore * 0.2),
                        2
                    );
                } else {
                    // Without project committee: 40% supervisor + 60% discussion committee
                    $fd1FinalGrade = round(
                        ($fd1SupervisorScore * 0.4) + ($fd1DiscussionCommitteeScore * 0.6),
                        2
                    );
                }

                // FD2 Defense Grades (similar to FD1 but slightly higher scores)
                $fd2SupervisorScore = (float) fake()->numberBetween(75, 98);
                $fd2DiscussionCommitteeScore = (float) min(100, max(0, $fd2SupervisorScore + fake()->numberBetween(-3, 3)));
                $fd2ProjectCommitteeScore = null;
                
                // Calculate FD2 final grade
                if ($project->projectCommittee) {
                    $fd2ProjectCommitteeScore = (float) min(100, max(0, $fd2SupervisorScore + fake()->numberBetween(-2, 2)));
                    $fd2FinalGrade = round(
                        ($fd2SupervisorScore * 0.4) + 
                        ($fd2DiscussionCommitteeScore * 0.4) + 
                        ($fd2ProjectCommitteeScore * 0.2),
                        2
                    );
                } else {
                    $fd2FinalGrade = round(
                        ($fd2SupervisorScore * 0.4) + ($fd2DiscussionCommitteeScore * 0.6),
                        2
                    );
                }

                // Approval status: some FD1 grades are approved, FD2 grades are pending
                $fd1Approved = fake()->boolean(60); // 60% chance FD1 is approved
                $fd1Published = $fd1Approved && fake()->boolean(50); // 50% chance published if approved
                $fd2Approved = false; // FD2 grades are pending for testing
                $fd2Published = false;

                Grade::create([
                    'project_id' => $project->id,
                    'student_id' => $student->id,
                    // Legacy grades (for backward compatibility)
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
                    // FD1 Defense Grades
                    'fd1_final_grade' => $fd1FinalGrade,
                    'fd1_approved' => $fd1Approved,
                    'fd1_published' => $fd1Published,
                    // FD2 Defense Grades
                    'fd2_final_grade' => $fd2FinalGrade,
                    'fd2_approved' => $fd2Approved,
                    'fd2_published' => $fd2Published,
                    // Overall approval (legacy)
                    'is_approved' => false,
                    'approved_at' => null,
                    'approved_by' => null,
                ]);
                $created++;
                
                if ($fd1Approved) $fd1Grades++;
                if ($fd2Approved) $fd2Grades++;
            }
        }

        $this->command->info('تم إنشاء الدرجات (عربي) / Created grades (Arabic):');
        $this->command->info('- ' . $created . ' سجل درجة / grade record(s)');
        $this->command->info('- ' . $fd1Grades . ' درجات FD1 معتمدة / FD1 grades approved');
        $this->command->info('- ' . ($created - $fd1Grades) . ' درجات FD1 قيد الانتظار / FD1 grades pending');
        $this->command->info('- جميع درجات FD2 قيد الانتظار / All FD2 grades pending (for testing)');
    }
}
