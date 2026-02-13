<?php

namespace Database\Factories;

use App\Models\DiscussionCommittee;
use Database\Seeders\helpers\YemeniDataHelper;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DiscussionCommittee>
 */
class DiscussionCommitteeFactory extends Factory
{
    protected $model = DiscussionCommittee::class;

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
