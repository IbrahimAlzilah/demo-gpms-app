<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with multiple Arabic demo records for all roles and core entities (for testing).
     * Run order: Users → Settings → TimePeriods → Committees → Proposals → Projects → Grades → DefenseEvaluations → DefenseApprovals
     * (respects FKs and workflow).
     * 
     * See database/seeders/SEEDERS_COMPATIBILITY.md for:
     * - Field mapping between Frontend forms, Backend models, and Seeders
     * - Validation alignment checklist
     * - Manual verification checklist
     * - Known issues and fixes applied
     *
     * Populates automatically when you run:
     *   php artisan db:seed
     *   php artisan migrate --seed
     *   php artisan migrate:fresh --seed
     */
    public function run(): void
    {
        $this->call([
            UsersSeeder::class,              // 1. Users with all roles and profiles
            SettingsSeeder::class,           // 2. System settings (validation constraints)
            TimePeriodsSeeder::class,        // 3. Time periods (all 10 types, 4 active for testing)
            CommitteesSeeder::class,         // 4. Project and discussion committees
            ProposalsSeeder::class,          // 5. Proposals (supervisor and student submissions)
            ProjectsSeeder::class,           // 6. Projects, student groups, registrations
            GradesSeeder::class,             // 7. Grades with FD1/FD2 fields
            DefenseEvaluationsSeeder::class, // 8. Defense evaluations (FD1 and FD2)
            DefenseApprovalsSeeder::class,   // 9. Defense approvals (pending/approved/published)
        ]);
    }
}
