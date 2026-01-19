<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\TimePeriod;
use App\Models\User;
use Illuminate\Database\Seeder;

class TimePeriodsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();
        
        if (!$admin) {
            $this->command->warn('No admin user found. Skipping time periods seeding.');
            return;
        }
        
        $projects = Project::all();

        // Create active time periods
        $activePeriods = TimePeriod::factory()
            ->count(3)
            ->active()
            ->create([
                'created_by' => $admin->id,
            ]);

        // Create inactive time periods
        $inactivePeriods = TimePeriod::factory()
            ->count(2)
            ->inactive()
            ->create([
                'created_by' => $admin->id,
            ]);

        // Attach projects to time periods (many-to-many)
        $allPeriods = $activePeriods->merge($inactivePeriods);
        foreach ($allPeriods as $period) {
            $periodProjects = $projects->random(fake()->numberBetween(2, 5));
            $existingProjectIds = $period->projects()->pluck('projects.id')->toArray();
            $newProjectIds = $periodProjects->pluck('id')->diff($existingProjectIds)->toArray();
            if (!empty($newProjectIds)) {
                $period->projects()->attach($newProjectIds);
            }
        }

        $this->command->info('Created time periods:');
        $this->command->info('- ' . $activePeriods->count() . ' active');
        $this->command->info('- ' . $inactivePeriods->count() . ' inactive');
    }
}
