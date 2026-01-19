<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProjectGroup>
 */
class ProjectGroupFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'leader_id' => User::factory()->student(),
            'max_members' => fake()->numberBetween(2, 5),
            'group_name' => fake()->company() . ' Team',
        ];
    }
}
