<?php

namespace Database\Factories;

use Database\Seeders\helpers\YemeniDataHelper;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = YemeniDataHelper::yemeniName();
        $emailDomain = YemeniDataHelper::yemeniEmailDomain();
        $emailUsername = Str::slug(explode(' ', $name)[0]) . '.' . fake()->unique()->numberBetween(100, 9999);
        
        return [
            'name' => $name,
            'email' => $emailUsername . '@' . $emailDomain,
            'username' => 'temp_' . Str::random(10) . '_' . time(), // Temporary username, will be replaced by seeder
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'role' => 'student',
            'status' => 'active',
            'phone' => YemeniDataHelper::yemeniPhoneNumber(),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Create a student user.
     */
    public function student(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'student',
            'status' => 'active',
        ]);
    }

    /**
     * Create a supervisor user.
     */
    public function supervisor(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'supervisor',
            'status' => 'active',
        ]);
    }

    /**
     * Create a discussion committee member.
     */
    public function discussionCommittee(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'discussion_committee',
            'status' => 'active',
        ]);
    }

    /**
     * Create a projects committee member.
     */
    public function projectsCommittee(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'projects_committee',
            'status' => 'active',
        ]);
    }

    /**
     * Create an admin user.
     */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'admin',
            'status' => 'active',
            'username' => 'admin' . fake()->unique()->numberBetween(1, 9999), // Will be set to 'admin' for first admin in seeder
        ]);
    }
}
