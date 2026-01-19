<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Document>
 */
class DocumentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = ['proposal', 'chapters', 'final_report', 'code', 'presentation', 'other'];
        $mimeTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'application/zip',
        ];

        return [
            'type' => fake()->randomElement($types),
            'project_id' => Project::factory(),
            'file_name' => fake()->word() . '.' . fake()->fileExtension(),
            'file_path' => 'documents/' . fake()->uuid() . '.pdf',
            'file_size' => fake()->numberBetween(10000, 5000000),
            'mime_type' => fake()->randomElement($mimeTypes),
            'submitted_by' => User::factory()->student(),
            'reviewed_by' => null,
            'reviewed_at' => null,
            'review_status' => fake()->randomElement(['pending', 'approved', 'rejected']),
            'review_comments' => fake()->optional()->paragraph(),
        ];
    }

    /**
     * Set document as approved.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'review_status' => 'approved',
            'reviewed_by' => User::factory()->supervisor(),
            'reviewed_at' => now(),
        ]);
    }

    /**
     * Set document as pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'review_status' => 'pending',
            'reviewed_by' => null,
            'reviewed_at' => null,
        ]);
    }
}
