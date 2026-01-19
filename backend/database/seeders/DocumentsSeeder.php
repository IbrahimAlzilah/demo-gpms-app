<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class DocumentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $projects = Project::whereHas('students')->get();
        $supervisors = User::where('role', 'supervisor')->get();

        foreach ($projects as $project) {
            $students = $project->students;

            // Create various document types for each project
            $documentTypes = ['proposal', 'chapters', 'final_report', 'code', 'presentation'];

            foreach ($documentTypes as $type) {
                $isApproved = fake()->boolean(40);
                $document = Document::factory()
                    ->create([
                        'type' => $type,
                        'project_id' => $project->id,
                        'submitted_by' => $students->random()->id,
                        'review_status' => $isApproved ? 'approved' : fake()->randomElement(['pending', 'rejected']),
                        'reviewed_by' => $isApproved ? $supervisors->random()->id : null,
                        'reviewed_at' => $isApproved ? now() : null,
                    ]);

                if ($isApproved && fake()->boolean(30)) {
                    $document->update([
                        'review_comments' => fake()->sentence(),
                    ]);
                }
            }
        }

        $this->command->info('Created documents for ' . $projects->count() . ' projects');
    }
}
