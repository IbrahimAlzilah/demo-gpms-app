<?php

namespace Database\Factories;

use App\Enums\ProposalStatus;
use App\Models\Project;
use App\Models\User;
use Database\Seeders\helpers\YemeniDataHelper;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Proposal>
 * 
 * Note: This factory creates users automatically for testing purposes.
 * In seeders, prefer passing existing user IDs to avoid creating extra users.
 */
class ProposalFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => YemeniDataHelper::yemeniProposalTitle(),
            'description' => YemeniDataHelper::yemeniProposalDescription(),
            'submitter_id' => User::factory()->student(),
            'proposed_supervisor_id' => User::factory()->supervisor(),
            'team_members' => null,
            'status' => fake()->randomElement(ProposalStatus::cases()),
            'review_notes' => fake()->optional()->paragraph(),
            'reviewed_by' => null,
            'reviewed_at' => null,
            'project_id' => null,
            'student_group_id' => null,
            'target_project_id' => null,
        ];
    }

    /**
     * Set proposal as approved and link to project.
     */
    public function approved(Project $project = null): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ProposalStatus::APPROVED,
            'project_id' => $project?->id,
            'reviewed_by' => User::factory()->projectsCommittee(),
            'reviewed_at' => now(),
        ]);
    }

    /**
     * Set proposal as pending review.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ProposalStatus::PENDING_REVIEW,
            'reviewed_by' => null,
            'reviewed_at' => null,
        ]);
    }
}
