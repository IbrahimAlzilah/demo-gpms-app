<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\ProjectGroup;
use Illuminate\Database\Seeder;

class GroupsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get projects that have students assigned
        $projects = Project::whereHas('students')->get();

        foreach ($projects as $project) {
            // Skip if group already exists (one-to-one relationship)
            if ($project->group) {
                continue;
            }
            
            // Create a group for each project (one-to-one relationship)
            $students = $project->students;
            
            if ($students->isEmpty()) {
                continue;
            }
            
            $leader = $students->first();

            $group = ProjectGroup::create([
                'project_id' => $project->id,
                'leader_id' => $leader->id,
                'max_members' => $project->max_students,
                'group_name' => fake()->company() . ' Team',
            ]);

            // Attach all students as group members (only if not already attached)
            $existingMemberIds = $group->members()->pluck('users.id')->toArray();
            $newMemberIds = $students->pluck('id')->diff($existingMemberIds)->toArray();
            if (!empty($newMemberIds)) {
                $group->members()->attach($newMemberIds);
            }

            $this->command->info("Created group '{$group->group_name}' for project '{$project->title}'");
        }

        $this->command->info('Created ' . $projects->count() . ' project groups');
    }
}
