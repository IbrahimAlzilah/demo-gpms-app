<?php

namespace Database\Factories;

use Database\Seeders\helpers\YemeniDataHelper;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DiscussionCommittee>
 */
class DiscussionCommitteeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => YemeniDataHelper::yemeniCommitteeName('discussion'),
            'department' => YemeniDataHelper::yemeniDepartment(),
        ];
    }
}
