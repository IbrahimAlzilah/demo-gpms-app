<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Grade>
 */
class GradeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $supervisorScore = fake()->optional(0.7)->numberBetween(60, 100);
        $committeeScore = fake()->optional(0.7)->numberBetween(60, 100);
        $finalGrade = null;

        if ($supervisorScore !== null && $committeeScore !== null) {
            $finalGrade = ($supervisorScore + $committeeScore) / 2;
        } elseif ($supervisorScore !== null) {
            $finalGrade = $supervisorScore;
        } elseif ($committeeScore !== null) {
            $finalGrade = $committeeScore;
        }

        return [
            'project_id' => Project::factory(),
            'student_id' => User::factory()->student(),
            'supervisor_grade' => $supervisorScore ? [
                'score' => $supervisorScore,
                'comments' => fake()->optional()->sentence(),
            ] : null,
            'committee_grade' => $committeeScore ? [
                'score' => $committeeScore,
                'comments' => fake()->optional()->sentence(),
            ] : null,
            'final_grade' => $finalGrade,
            'is_approved' => fake()->boolean(60),
            'approved_at' => fake()->optional(0.6)->dateTime(),
            'approved_by' => fake()->optional(0.6)->randomElement([
                User::factory()->supervisor(),
                User::factory()->projectsCommittee(),
            ]),
        ];
    }

    /**
     * Create a complete grade with both supervisor and committee scores.
     */
    public function complete(): static
    {
        $supervisorScore = fake()->numberBetween(70, 100);
        $committeeScore = fake()->numberBetween(70, 100);
        $finalGrade = ($supervisorScore + $committeeScore) / 2;

        return $this->state(fn (array $attributes) => [
            'supervisor_grade' => [
                'score' => $supervisorScore,
                'comments' => fake()->sentence(),
            ],
            'committee_grade' => [
                'score' => $committeeScore,
                'comments' => fake()->sentence(),
            ],
            'final_grade' => $finalGrade,
            'is_approved' => true,
            'approved_at' => now(),
        ]);
    }
}
