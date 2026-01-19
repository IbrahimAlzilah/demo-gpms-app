<?php

namespace Database\Factories;

use App\Enums\TimePeriodType;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TimePeriod>
 */
class TimePeriodFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('-1 month', '+1 month');
        $endDate = fake()->dateTimeBetween($startDate, '+3 months');

        return [
            'name' => fake()->sentence(3),
            'type' => fake()->randomElement(TimePeriodType::cases())->value,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'is_active' => fake()->boolean(70),
            'academic_year' => fake()->randomElement(['2024-2025', '2025-2026', '2026-2027']),
            'semester' => fake()->randomElement(['Fall', 'Spring', 'Summer']),
            'description' => fake()->optional()->paragraph(),
            'created_by' => User::factory()->admin(),
        ];
    }

    /**
     * Create an active time period.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
            'start_date' => now()->subDays(7),
            'end_date' => now()->addDays(30),
        ]);
    }

    /**
     * Create an inactive time period.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
            'start_date' => now()->subMonths(3),
            'end_date' => now()->subMonth(),
        ]);
    }
}
