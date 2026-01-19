<?php

namespace Database\Factories;

use App\Models\Notification;
use App\Models\Project;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Notification>
 */
class NotificationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $relatedEntity = fake()->optional(0.6)->randomElement([
            Project::class,
            Proposal::class,
        ]);

        return [
            'user_id' => User::factory(),
            'message' => fake()->sentence(),
            'is_read' => fake()->boolean(30),
            'type' => fake()->randomElement(['proposal_reviewed', 'project_assigned', 'grade_posted', 'request_approved', 'document_reviewed', 'general']),
            'related_entity_type' => $relatedEntity,
            'related_entity_id' => $relatedEntity ? fake()->numberBetween(1, 100) : null,
            'read_at' => fake()->optional(0.3)->dateTime(),
        ];
    }

    /**
     * Create an unread notification.
     */
    public function unread(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_read' => false,
            'read_at' => null,
        ]);
    }

    /**
     * Create a read notification.
     */
    public function read(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_read' => true,
            'read_at' => now(),
        ]);
    }
}
