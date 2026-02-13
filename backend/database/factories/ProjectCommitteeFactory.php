<?php

namespace Database\Factories;

use App\Models\ProjectCommittee;
use Database\Seeders\helpers\YemeniDataHelper;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProjectCommittee>
 */
class ProjectCommitteeFactory extends Factory
{
    protected $model = ProjectCommittee::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => YemeniDataHelper::yemeniCommitteeName('project'),
            'department' => YemeniDataHelper::yemeniDepartment(),
        ];
    }
}
