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
     * Creates all time period types required for complete workflow testing.
     * Proposal submission and defense periods are active by default for testing.
     */
    public function run(): void
    {
        // Get admin user for created_by
        $admin = User::where('role', 'admin')->first();

        if (!$admin) {
            $this->command->warn('No admin user found. TimePeriodsSeeder should run after UsersSeeder.');
            return;
        }

        $academicYear = now()->format('Y') . '-' . (now()->format('Y') + 1);
        $semester = 'الفصل الأول';
        $createdCount = 0;

        // 1. Proposal Submission (Active - for testing proposal creation)
        TimePeriod::updateOrCreate(
            ['type' => TimePeriodType::PROPOSAL_SUBMISSION->value],
            [
                'name' => 'فترة تقديم المقترحات',
                'type' => TimePeriodType::PROPOSAL_SUBMISSION->value,
                'start_date' => now()->subDays(7),
                'end_date' => now()->addDays(30),
                'is_active' => true,
                'academic_year' => $academicYear,
                'semester' => $semester,
                'description' => 'فترة تقديم مقترحات المشاريع من الطلاب والمشرفين',
                'created_by' => $admin->id,
            ]
        );
        $createdCount++;

        // 2. Project Registration (Inactive - future period)
        TimePeriod::updateOrCreate(
            ['type' => TimePeriodType::PROJECT_REGISTRATION->value],
            [
                'name' => 'فترة تسجيل المشاريع',
                'type' => TimePeriodType::PROJECT_REGISTRATION->value,
                'start_date' => now()->addDays(31),
                'end_date' => now()->addDays(60),
                'is_active' => false,
                'academic_year' => $academicYear,
                'semester' => $semester,
                'description' => 'فترة تسجيل الطلاب في المشاريع المعتمدة',
                'created_by' => $admin->id,
            ]
        );
        $createdCount++;

        // 3. Request Submission (Active - for testing student requests)
        TimePeriod::updateOrCreate(
            ['type' => TimePeriodType::REQUEST_SUBMISSION->value],
            [
                'name' => 'فترة تقديم الطلبات',
                'type' => TimePeriodType::REQUEST_SUBMISSION->value,
                'start_date' => now()->subDays(3),
                'end_date' => now()->addDays(45),
                'is_active' => true,
                'academic_year' => $academicYear,
                'semester' => $semester,
                'description' => 'فترة تقديم طلبات تغيير المشرف أو المجموعة أو المشروع',
                'created_by' => $admin->id,
            ]
        );
        $createdCount++;

        // 4. Chapter Submission Phase 1 (Inactive - future period)
        TimePeriod::updateOrCreate(
            ['type' => TimePeriodType::CHAPTER_SUBMISSION_PHASE_1->value],
            [
                'name' => 'فترة تسليم الفصول - المرحلة الأولى',
                'type' => TimePeriodType::CHAPTER_SUBMISSION_PHASE_1->value,
                'start_date' => now()->addDays(61),
                'end_date' => now()->addDays(90),
                'is_active' => false,
                'academic_year' => $academicYear,
                'semester' => $semester,
                'description' => 'فترة تسليم الفصول الأولى من المشروع (عادة 3 فصول)',
                'created_by' => $admin->id,
            ]
        );
        $createdCount++;

        // 5. Final Defense Phase 1 (Active - for testing FD1 evaluations)
        TimePeriod::updateOrCreate(
            ['type' => TimePeriodType::FINAL_DEFENSE_PHASE_1->value],
            [
                'name' => 'فترة المناقشة النهائية - المرحلة الأولى',
                'type' => TimePeriodType::FINAL_DEFENSE_PHASE_1->value,
                'start_date' => now()->subDays(5),
                'end_date' => now()->addDays(25),
                'is_active' => true,
                'academic_year' => $academicYear,
                'semester' => $semester,
                'description' => 'فترة المناقشة النهائية للمرحلة الأولى من المشروع',
                'created_by' => $admin->id,
            ]
        );
        $createdCount++;

        // 6. Chapter Submission Phase 2 (Inactive - future period)
        TimePeriod::updateOrCreate(
            ['type' => TimePeriodType::CHAPTER_SUBMISSION_PHASE_2->value],
            [
                'name' => 'فترة تسليم الفصول - المرحلة الثانية',
                'type' => TimePeriodType::CHAPTER_SUBMISSION_PHASE_2->value,
                'start_date' => now()->addDays(91),
                'end_date' => now()->addDays(120),
                'is_active' => false,
                'academic_year' => $academicYear,
                'semester' => $semester,
                'description' => 'فترة تسليم الفصول المتبقية من المشروع',
                'created_by' => $admin->id,
            ]
        );
        $createdCount++;

        // 7. Final Defense Phase 2 (Inactive - future period)
        TimePeriod::updateOrCreate(
            ['type' => TimePeriodType::FINAL_DEFENSE_PHASE_2->value],
            [
                'name' => 'فترة المناقشة النهائية - المرحلة الثانية',
                'type' => TimePeriodType::FINAL_DEFENSE_PHASE_2->value,
                'start_date' => now()->addDays(121),
                'end_date' => now()->addDays(150),
                'is_active' => false,
                'academic_year' => $academicYear,
                'semester' => $semester,
                'description' => 'فترة المناقشة النهائية للمرحلة الثانية من المشروع',
                'created_by' => $admin->id,
            ]
        );
        $createdCount++;

        // 8. Final Project Document Submission (Inactive - future period)
        TimePeriod::updateOrCreate(
            ['type' => TimePeriodType::FINAL_PROJECT_DOCUMENT_SUBMISSION->value],
            [
                'name' => 'فترة تسليم الوثيقة النهائية',
                'type' => TimePeriodType::FINAL_PROJECT_DOCUMENT_SUBMISSION->value,
                'start_date' => now()->addDays(151),
                'end_date' => now()->addDays(165),
                'is_active' => false,
                'academic_year' => $academicYear,
                'semester' => $semester,
                'description' => 'فترة تسليم الوثيقة النهائية للمشروع بعد المناقشة',
                'created_by' => $admin->id,
            ]
        );
        $createdCount++;

        // 9. Grade Approval (Active - for testing grade approval workflow)
        TimePeriod::updateOrCreate(
            ['type' => TimePeriodType::GRADE_APPROVAL->value],
            [
                'name' => 'فترة اعتماد الدرجات',
                'type' => TimePeriodType::GRADE_APPROVAL->value,
                'start_date' => now()->subDays(2),
                'end_date' => now()->addDays(35),
                'is_active' => true,
                'academic_year' => $academicYear,
                'semester' => $semester,
                'description' => 'فترة مراجعة واعتماد درجات المشاريع',
                'created_by' => $admin->id,
            ]
        );
        $createdCount++;

        // 10. General (Optional - covers all periods)
        TimePeriod::updateOrCreate(
            ['type' => TimePeriodType::GENERAL->value],
            [
                'name' => 'فترة عامة',
                'type' => TimePeriodType::GENERAL->value,
                'start_date' => now()->subDays(30),
                'end_date' => now()->addDays(180),
                'is_active' => false, // Inactive by default, can be activated by admin
                'academic_year' => $academicYear,
                'semester' => $semester,
                'description' => 'فترة عامة تتضمن جميع الفترات الأخرى (للاستخدام في حالات خاصة)',
                'created_by' => $admin->id,
            ]
        );
        $createdCount++;

        $this->command->info('تم إنشاء الفترات الزمنية (عربي) / Created time periods (Arabic):');
        $this->command->info('- المجموع / Total: ' . $createdCount . ' فترات / periods');
        $this->command->info('- النشطة / Active: فترة تقديم المقترحات، فترة تقديم الطلبات، المناقشة الأولى، اعتماد الدرجات');
        $this->command->info('- غير النشطة / Inactive: باقي الفترات (للاستخدام المستقبلي)');
    }
}
