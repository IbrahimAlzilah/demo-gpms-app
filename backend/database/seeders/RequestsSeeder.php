<?php

namespace Database\Seeders;

use App\Enums\RequestStatus;
use App\Models\Project;
use App\Models\ProjectRequest;
use App\Models\User;
use Illuminate\Database\Seeder;

class RequestsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $students = User::where('role', 'student')->get();
        $projects = Project::whereHas('students')->get();
        $projectsCommitteeMembers = User::where('role', 'projects_committee')->get();

        // Create pending requests
        for ($i = 0; $i < 5; $i++) {
            ProjectRequest::factory()
                ->pending()
                ->create([
                    'student_id' => $students->random()->id,
                    'project_id' => $projects->random()->id,
                ]);
        }

        // Create approved requests
        for ($i = 0; $i < 3; $i++) {
            ProjectRequest::factory()
                ->approved()
                ->create([
                    'student_id' => $students->random()->id,
                    'project_id' => $projects->random()->id,
                    'committee_approval' => [
                        'approved_by' => $projectsCommitteeMembers->random()->id,
                        'approved_at' => now(),
                        'comments' => fake()->sentence(),
                    ],
                ]);
        }

        // Create rejected requests
        for ($i = 0; $i < 2; $i++) {
            ProjectRequest::factory()
                ->create([
                    'status' => RequestStatus::COMMITTEE_REJECTED,
                    'student_id' => $students->random()->id,
                    'project_id' => $projects->random()->id,
                    'committee_approval' => [
                        'rejected_by' => $projectsCommitteeMembers->random()->id,
                        'rejected_at' => now(),
                        'comments' => fake()->sentence(),
                    ],
                ]);
        }

        $pendingCount = ProjectRequest::where('status', RequestStatus::PENDING->value)->count();
        $approvedCount = ProjectRequest::where('status', RequestStatus::COMMITTEE_APPROVED->value)->count();
        $rejectedCount = ProjectRequest::where('status', RequestStatus::COMMITTEE_REJECTED->value)->count();

        $this->command->info('Created requests:');
        $this->command->info('- ' . $pendingCount . ' pending');
        $this->command->info('- ' . $approvedCount . ' approved');
        $this->command->info('- ' . $rejectedCount . ' rejected');
    }
}
