<?php

namespace Database\Factories;

use App\Models\Student;
use App\Models\User;
use Database\Seeders\helpers\YemeniDataHelper;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Student>
 */
class StudentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->student(),
            'student_id' => 'STU' . str_pad((string) fake()->unique()->numberBetween(1000, 9999), 4, '0', STR_PAD_LEFT),
            'major' => YemeniDataHelper::yemeniDepartment(),
            'academic_level' => YemeniDataHelper::yemeniAcademicLevel(),
        ];
    }

    /**
     * Create a student with an existing user.
     */
    public function forUser(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $user->id,
        ]);
    }
}
