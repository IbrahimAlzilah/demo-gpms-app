<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\TimePeriod;
use App\Models\Project;
use App\Models\Proposal;
use App\Models\StudentGroup;
use Illuminate\Database\Seeder;

class ProjectCommitteeWorkflowSeeder extends Seeder
{
    /**
     * Seed the application's database for testing Project Committee workflow.
     */
    public function run(): void
    {
        $this->command->info('🌱 Seeding Project Committee Workflow data...');

        // 1. Create Project Committee member if not exists
        $committeeUser = User::firstOrCreate(
            ['email' => 'committee@example.com'],
            [
                'name' => 'لجنة المشاريع',
                'username' => 'committee',
                'role' => 'projects_committee',
                'status' => 'active',
                'password' => bcrypt('password'),
            ]
        );
        $this->command->info('✅ Project Committee member created/found');

        // 2. Create Supervisors
        $supervisors = [];
        for ($i = 1; $i <= 5; $i++) {
            $supervisors[] = User::firstOrCreate(
                ['email' => "supervisor{$i}@example.com"],
                [
                    'name' => "د. المشرف {$i}",
                    'username' => "supervisor{$i}",
                    'role' => 'supervisor',
                    'status' => 'active',
                    'password' => bcrypt('password'),
                ]
            );
        }
        $this->command->info('✅ 5 Supervisors created/found');

        // 3. Create Students
        $students = [];
        for ($i = 1; $i <= 10; $i++) {
            $students[] = User::firstOrCreate(
                ['email' => "student{$i}@example.com"],
                [
                    'name' => "طالب {$i}",
                    'username' => "student{$i}",
                    'role' => 'student',
                    'status' => 'active',
                    'password' => bcrypt('password'),
                ]
            );
        }
        $this->command->info('✅ 10 Students created/found');

        // 4. Create Time Periods
        $periods = [
            [
                'name' => 'فترة تقديم المقترحات',
                'type' => 'proposal_submission',
                'start_date' => now()->subDays(30),
                'end_date' => now()->addDays(30),
                'is_active' => true,
            ],
            [
                'name' => 'فترة تسجيل المشاريع',
                'type' => 'project_registration',
                'start_date' => now()->addDays(31),
                'end_date' => now()->addDays(60),
                'is_active' => false,
            ],
        ];

        foreach ($periods as $periodData) {
            TimePeriod::firstOrCreate(
                [
                    'type' => $periodData['type'],
                    'start_date' => $periodData['start_date'],
                ],
                array_merge($periodData, ['created_by' => $committeeUser->id])
            );
        }
        $this->command->info('✅ Time Periods created/found');

        // 5. Create Student Groups
        $groups = [];
        for ($i = 0; $i < 3; $i++) {
            $leader = $students[$i * 3];
            $group = StudentGroup::firstOrCreate(
                ['code' => "GRP-202{$i}"],
                [
                    'name' => "مجموعة {$i + 1}",
                    'leader_id' => $leader->id,
                ]
            );

            // Add members
            $group->members()->syncWithoutDetaching([
                $students[$i * 3 + 1]->id,
                $students[$i * 3 + 2]->id,
            ]);

            $groups[] = $group;
        }
        $this->command->info('✅ 3 Student Groups created/found');

        // 6. Create Proposals (some pending, some approved)
        $proposalStatuses = ['pending_review', 'approved', 'requires_modification'];
        foreach ($groups as $index => $group) {
            Proposal::firstOrCreate(
                [
                    'submitter_id' => $group->leader_id,
                    'student_group_id' => $group->id,
                ],
                [
                    'title' => "مقترح مشروع {$index + 1}",
                    'description' => "وصف تفصيلي للمقترح رقم {$index + 1}. يهدف هذا المشروع إلى تطوير نظام متكامل لإدارة المشاريع الطلابية.",
                    'proposed_supervisor_id' => $supervisors[$index]->id,
                    'status' => $proposalStatuses[$index % 3],
                    'reviewed_by' => $index > 0 ? $committeeUser->id : null,
                    'reviewed_at' => $index > 0 ? now() : null,
                ]
            );
        }
        $this->command->info('✅ Proposals created/found');

        // 7. Create Projects (some without supervisors for assignment)
        $projectStatuses = ['draft', 'available_for_registration', 'active'];
        for ($i = 0; $i < 5; $i++) {
            Project::firstOrCreate(
                ['title' => "مشروع تخرج {$i + 1}"],
                [
                    'description' => "وصف مشروع التخرج رقم {$i + 1}. يتضمن هذا المشروع تطوير نظام شامل باستخدام أحدث التقنيات.",
                    'status' => $projectStatuses[$i % 3],
                    'supervisor_id' => $i < 2 ? null : $supervisors[$i - 2]->id, // First 2 without supervisor
                    'max_students' => 3,
                    'current_students' => 0,
                    'specialization' => 'علوم الحاسب',
                ]
            );
        }
        $this->command->info('✅ Projects created/found (2 without supervisors)');

        $this->command->info('');
        $this->command->info('🎉 Project Committee Workflow data seeded successfully!');
        $this->command->info('');
        $this->command->info('📝 Test Accounts:');
        $this->command->info('   Committee: committee@example.com / password');
        $this->command->info('   Supervisors: supervisor1@example.com to supervisor5@example.com / password');
        $this->command->info('   Students: student1@example.com to student10@example.com / password');
    }
}
