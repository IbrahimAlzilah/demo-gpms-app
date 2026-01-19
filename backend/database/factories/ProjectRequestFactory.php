<?php

namespace Database\Factories;

use App\Enums\RequestStatus;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProjectRequest>
 */
class ProjectRequestFactory extends Factory
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
            RequestStatus::PENDING,
            RequestStatus::COMMITTEE_APPROVED,
            RequestStatus::COMMITTEE_REJECTED,
            RequestStatus::CANCELLED,
        ];
        
        return [
            'type' => fake()->randomElement(['change_supervisor', 'change_group', 'change_project', 'other']),
            'student_id' => User::factory()->student(),
            'project_id' => null, // Will be set in seeder
            'reason' => fake()->paragraph(2),
            'status' => fake()->randomElement($validStatuses),
            'supervisor_approval' => null,
            'committee_approval' => null,
            'additional_data' => null,
        ];
    }

    /**
     * Set request as pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => RequestStatus::PENDING,
        ]);
    }

    /**
     * Set request as approved by committee.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => RequestStatus::COMMITTEE_APPROVED,
            'committee_approval' => [
                'approved_by' => User::factory()->projectsCommittee(),
                'approved_at' => now(),
                'comments' => fake()->sentence(),
            ],
        ]);
    }
}
