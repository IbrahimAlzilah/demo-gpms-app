<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UsersSeeder::class,
            CommitteesSeeder::class,
            SettingsSeeder::class,
            ProjectsSeeder::class,
            GroupsSeeder::class,
            ProposalsSeeder::class,
            DocumentsSeeder::class,
            GradesSeeder::class,
            RequestsSeeder::class,
        ]);
    }
}
