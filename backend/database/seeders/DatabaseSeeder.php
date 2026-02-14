<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with multiple Arabic demo records for all roles and core entities (for testing).
     * Populates automatically when you run:
     *   php artisan db:seed
     *   php artisan migrate --seed
     *   php artisan migrate:fresh --seed
     */
    public function run(): void
    {
        $this->call([
            UsersSeeder::class,
            SettingsSeeder::class,
            TimePeriodsSeeder::class,
            CommitteesSeeder::class,
            ProposalsSeeder::class,
            ProjectsSeeder::class,
            GradesSeeder::class,
        ]);
    }
}
