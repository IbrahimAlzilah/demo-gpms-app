<?php

namespace Database\Seeders;

use App\Enums\ProjectStatus;
use App\Models\Grade;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class GradesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get projects that are completed or in progress
        $projects = Project::whereIn('status', [
            ProjectStatus::IN_PROGRESS->value,
            ProjectStatus::COMPLETED->value,
        ])->get();
        $supervisors = User::where('role', 'supervisor')->get();
        $projectsCommitteeMembers = User::where('role', 'projects_committee')->get();

        foreach ($projects as $project) {
            $students = $project->students;

            foreach ($students as $student) {
                // Skip if grade already exists (unique constraint: project_id, student_id)
                $existingGrade = Grade::where('project_id', $project->id)
                    ->where('student_id', $student->id)
                    ->first();
                
                if ($existingGrade) {
                    continue;
                }
                
                // Create grade for each student in the project
                $isComplete = $project->status === ProjectStatus::COMPLETED;
                
                if ($isComplete) {
                    // Completed projects get full grades
                    Grade::factory()
                        ->complete()
                        ->create([
                            'project_id' => $project->id,
                            'student_id' => $student->id,
                            'approved_by' => fake()->randomElement([
                                $project->supervisor_id,
                                $projectsCommitteeMembers->random()->id,
                            ]),
                        ]);
                } else {
                    // In-progress projects may have partial grades
                    Grade::factory()
                        ->create([
                            'project_id' => $project->id,
                            'student_id' => $student->id,
                        ]);
                }
            }
        }

        $this->command->info('Created grades for students in ' . $projects->count() . ' projects');
    }
}
