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
        $students = User::where('role', 'student')->get();
        $projectCommittees = ProjectCommittee::all();
        $discussionCommittees = DiscussionCommittee::all();

        // Create projects with various statuses (only if we don't have enough)
        $existingProjectsCount = Project::count();
        $targetProjectsCount = 16; // 5 + 8 + 3
        $projectsToCreate = max(0, $targetProjectsCount - $existingProjectsCount);
        $projects = collect();

        // Create some available for registration projects
        $availableCount = min(5, $projectsToCreate);
        for ($i = 0; $i < $availableCount; $i++) {
            $project = Project::factory()
                ->availableForRegistration()
                ->create([
                    'supervisor_id' => $supervisors->random()->id,
                    'project_committee_id' => $projectCommittees->random()->id,
                    'discussion_committee_id' => $discussionCommittees->random()->id,
                ]);

            // Attach some students to projects (only if not already attached)
            $projectStudents = $students->random(fake()->numberBetween(1, $project->max_students));
            $existingStudentIds = $project->students()->pluck('users.id')->toArray();
            $newStudentIds = $projectStudents->pluck('id')->diff($existingStudentIds)->toArray();
            if (!empty($newStudentIds)) {
                $project->students()->attach($newStudentIds);
            }
            $project->update(['current_students' => $project->students()->count()]);

            $projects->push($project);
        }

        // Create in-progress projects
        $inProgressCount = min(8, max(0, $projectsToCreate - $availableCount));
        for ($i = 0; $i < $inProgressCount; $i++) {
            $project = Project::factory()
                ->inProgress()
                ->create([
                    'supervisor_id' => $supervisors->random()->id,
                    'project_committee_id' => $projectCommittees->random()->id,
                    'discussion_committee_id' => $discussionCommittees->random()->id,
                ]);

            $projectStudents = $students->random(fake()->numberBetween(2, $project->max_students));
            $project->students()->attach($projectStudents->pluck('id'));
            $project->update(['current_students' => $projectStudents->count()]);

            $projects->push($project);
        }

        // Create completed projects
        $completedCount = min(3, max(0, $projectsToCreate - $availableCount - $inProgressCount));
        for ($i = 0; $i < $completedCount; $i++) {
            $project = Project::factory()
                ->completed()
                ->create([
                    'supervisor_id' => $supervisors->random()->id,
                    'project_committee_id' => $projectCommittees->random()->id,
                    'discussion_committee_id' => $discussionCommittees->random()->id,
                ]);

            $projectStudents = $students->random(fake()->numberBetween(2, $project->max_students));
            $project->students()->attach($projectStudents->pluck('id'));
            $project->update(['current_students' => $projectStudents->count()]);

            $projects->push($project);
        }

        // Get all projects (newly created + existing)
        $allProjects = Project::all();

        // Assign discussion committee members to projects (2-3 per project as per UML)
        $discussionCommitteeMembers = User::where('role', 'discussion_committee')->get();
        foreach ($allProjects as $project) {
            $committeeMembers = $discussionCommitteeMembers->random(fake()->numberBetween(2, 3));
            $existingMemberIds = $project->committeeMembers()->pluck('users.id')->toArray();
            $newMemberIds = $committeeMembers->pluck('id')->diff($existingMemberIds)->toArray();
            if (!empty($newMemberIds)) {
                $project->committeeMembers()->attach($newMemberIds);
            }
        }

        $this->command->info('Created ' . $projects->count() . ' new projects (Total: ' . $allProjects->count() . ')');
    }
}
