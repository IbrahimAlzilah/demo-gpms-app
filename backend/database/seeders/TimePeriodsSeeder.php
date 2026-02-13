<?php

namespace Database\Seeders;

use App\Enums\TimePeriodType;
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
        // Get admin user for created_by
        $admin = User::where('role', 'admin')->first();

        if (!$admin) {
            $this->command->warn('No admin user found. TimePeriodsSeeder should run after UsersSeeder.');
            return;
        }

        // Create active proposal submission window (required for proposal submission to work)
        TimePeriod::updateOrCreate(
            [
                'type' => TimePeriodType::PROPOSAL_SUBMISSION->value,
            ],
            [
                'name' => 'فترة تقديم المقترحات',
                'type' => TimePeriodType::PROPOSAL_SUBMISSION->value,
                'start_date' => now()->subDays(7), // Started 7 days ago
                'end_date' => now()->addDays(30), // Ends in 30 days
                'is_active' => true,
                'academic_year' => now()->format('Y') . '-' . (now()->format('Y') + 1),
                'semester' => 'الفصل الأول',
                'description' => 'فترة تقديم مقترحات المشاريع من الطلاب والمشرفين',
                'created_by' => $admin->id,
            ]
        );

        // Create inactive project registration window (optional, for UI expectations)
        TimePeriod::updateOrCreate(
            [
                'type' => TimePeriodType::PROJECT_REGISTRATION->value,
            ],
            [
                'name' => 'فترة تسجيل المشاريع',
                'type' => TimePeriodType::PROJECT_REGISTRATION->value,
                'start_date' => now()->addDays(31), // Starts in 31 days
                'end_date' => now()->addDays(60), // Ends in 60 days
                'is_active' => false, // Inactive for now
                'academic_year' => now()->format('Y') . '-' . (now()->format('Y') + 1),
                'semester' => 'الفصل الأول',
                'description' => 'فترة تسجيل الطلاب في المشاريع المعتمدة',
                'created_by' => $admin->id,
            ]
        );

        $this->command->info('تم إنشاء الفترات الزمنية (عربي) / Created time periods (Arabic):');
        $this->command->info('- 1 فترة تقديم مقترحات (نشطة) / proposal submission (active)');
        $this->command->info('- 1 فترة تسجيل مشاريع (غير نشطة) / project registration (inactive)');
    }
}
