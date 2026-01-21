<?php

namespace Database\Seeders;

use App\Enums\ProjectStatus;
use App\Models\Project;
use App\Models\ProjectCommittee;
use App\Models\DiscussionCommittee;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $supervisors = User::where('role', 'supervisor')->get();
        // Get students in random order
        $students = User::where('role', 'student')->inRandomOrder()->get();
        $projectCommittees = ProjectCommittee::all();
        $discussionCommittees = DiscussionCommittee::all();

        // Partition students:
        // Use 6 students for active projects (2 groups of 3)
        // Leave 4 students for proposals/other states
        $studentsForProjects = $students->take(6);
        $studentChunks = $studentsForProjects->chunk(3);

        $projects = collect();

        // 1. Create Fully Populated Projects (In Progress / Completed)
        foreach ($studentChunks as $index => $groupStudents) {
            $status = $index === 0 ? ProjectStatus::IN_PROGRESS : ProjectStatus::COMPLETED;
            
            $project = Project::factory()->create([
                'status' => $status,
                'supervisor_id' => $supervisors->random()->id,
                'project_committee_id' => $projectCommittees->random()->id,
                'discussion_committee_id' => $discussionCommittees->random()->id,
                'current_students' => $groupStudents->count(),
                'max_students' => 3,
            ]);

            $project->students()->attach($groupStudents->pluck('id'));
            $projects->push($project);
        }

        // 2. Create Available Projects (Empty)
        // Create 5 available projects for manual testing of registration
        for ($i = 0; $i < 5; $i++) {
            $project = Project::factory()
                ->availableForRegistration()
                ->create([
                    'supervisor_id' => $supervisors->random()->id,
                    'project_committee_id' => $projectCommittees->random()->id,
                    'discussion_committee_id' => $discussionCommittees->random()->id,
                    'current_students' => 0,
                    'max_students' => 3,
                ]);
            $projects->push($project);
        }

        // 3. Create Draft Projects (Empty)
        // Create 2 draft projects
        Project::factory()->count(2)->create([
            'status' => ProjectStatus::DRAFT,
            'supervisor_id' => $supervisors->random()->id,
            'project_committee_id' => $projectCommittees->random()->id,
            'discussion_committee_id' => $discussionCommittees->random()->id,
            'current_students' => 0,
        ]);

        // Assign discussion committee members to all projects
        $allProjects = Project::all();
        $discussionCommitteeMembers = User::where('role', 'discussion_committee')->get();
        
        if ($discussionCommitteeMembers->isNotEmpty()) {
            foreach ($allProjects as $project) {
                // Assign 2 members per project
                $committeeMembers = $discussionCommitteeMembers->take(2); 
                // Since we only have 3 members, taking 2 is fine. 
                // To vary it slightly, we can random shuffle if needed, but 'take(2)' is consistent.
                // Let's shuffle strictly for distribution if we care, or just take random.
                $committeeMembers = $discussionCommitteeMembers->random(min(2, $discussionCommitteeMembers->count()));
                
                $project->committeeMembers()->syncWithoutDetaching($committeeMembers->pluck('id'));
            }
        }

        $this->command->info('Created ' . $allProjects->count() . ' projects with consistent student assignments.');
    }
}
