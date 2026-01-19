<?php

namespace Database\Factories;

use App\Enums\ProjectStatus;
use App\Models\User;
use Database\Seeders\helpers\YemeniDataHelper;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Project>
 */
class ProjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Only use status values that exist in the database enum
        $validStatuses = [
            ProjectStatus::DRAFT,
            ProjectStatus::AVAILABLE_FOR_REGISTRATION,
            ProjectStatus::IN_PROGRESS,
            ProjectStatus::COMPLETED,
        ];
        
        return [
            'title' => YemeniDataHelper::yemeniProjectTitle(),
            'description' => YemeniDataHelper::yemeniProjectDescription(),
            'status' => fake()->randomElement($validStatuses),
            'supervisor_id' => User::factory()->supervisor(),
            'max_students' => fake()->numberBetween(2, 5),
            'current_students' => 0,
            'specialization' => YemeniDataHelper::yemeniProjectSpecialization(),
            'keywords' => fake()->words(5),
        ];
    }

    /**
     * Set project status to available for registration.
     */
    public function availableForRegistration(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ProjectStatus::AVAILABLE_FOR_REGISTRATION,
        ]);
    }

    /**
     * Set project status to in progress.
     */
    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ProjectStatus::IN_PROGRESS,
        ]);
    }

    /**
     * Set project status to completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ProjectStatus::COMPLETED,
        ]);
    }
}
