<?php

namespace Database\Seeders;

use App\Models\Student;
use App\Models\Supervisor;
use App\Models\User;
use Database\Seeders\helpers\YemeniDataHelper;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create or get admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@gpms.local'],
            [
                'name' => 'أحمد الأحد',
                'username' => 'admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'status' => 'active',
                'phone' => YemeniDataHelper::yemeniPhoneNumber(),
            ]
        );
        // Ensure admin has username set (in case user already existed or has temp username)
        if (!$admin->username || str_starts_with($admin->username, 'temp_')) {
            // Check if 'admin' username is already taken by another user
            $adminCount = User::where('role', 'admin')
                ->where('id', '!=', $admin->id)
                ->where('username', 'admin')
                ->count();
            $username = $adminCount === 0 ? 'admin' : 'admin' . ($adminCount + 1);
            $admin->update(['username' => $username]);
        }

        // Create supervisors (only if we don't have enough)
        $existingSupervisorsCount = User::where('role', 'supervisor')->count();
        $supervisorsToCreate = max(0, 5 - $existingSupervisorsCount);
        $supervisors = collect();
        if ($supervisorsToCreate > 0) {
            $supervisors = User::factory()
                ->count($supervisorsToCreate)
                ->supervisor()
                ->create();
        } else {
            $supervisors = User::where('role', 'supervisor')->take(5)->get();
        }

        // Create supervisor profiles (only if they don't exist)
        foreach ($supervisors as $supervisor) {
            $empId = 'EMP' . str_pad((string) fake()->unique()->numberBetween(1000, 9999), 4, '0', STR_PAD_LEFT);
            $profile = Supervisor::firstOrCreate(
                ['user_id' => $supervisor->id],
                [
                    'emp_id' => $empId,
                    'department' => YemeniDataHelper::yemeniDepartment(),
                ]
            );
            // Update username if not set or is temporary
            if (!$supervisor->username || str_starts_with($supervisor->username, 'temp_')) {
                $supervisor->update(['username' => $profile->emp_id]);
            }
        }

        // Create students (only if we don't have enough)
        $existingStudentsCount = User::where('role', 'student')->count();
        $studentsToCreate = max(0, 20 - $existingStudentsCount);
        $students = collect();
        if ($studentsToCreate > 0) {
            $students = User::factory()
                ->count($studentsToCreate)
                ->student()
                ->create();
        } else {
            $students = User::where('role', 'student')->take(20)->get();
        }

        // Create student profiles (only if they don't exist)
        foreach ($students as $student) {
            $studentId = 'STU' . str_pad((string) fake()->unique()->numberBetween(1000, 9999), 4, '0', STR_PAD_LEFT);
            $profile = Student::firstOrCreate(
                ['user_id' => $student->id],
                [
                    'student_id' => $studentId,
                    'major' => YemeniDataHelper::yemeniDepartment(),
                    'academic_level' => YemeniDataHelper::yemeniAcademicLevel(),
                ]
            );
            // Update username if not set or is temporary
            if (!$student->username || str_starts_with($student->username, 'temp_')) {
                $student->update(['username' => $profile->student_id]);
            }
        }

        // Create discussion committee members (only if we don't have enough)
        $existingDiscussionCount = User::where('role', 'discussion_committee')->count();
        $discussionToCreate = max(0, 6 - $existingDiscussionCount);
        $discussionCommitteeMembers = collect();
        if ($discussionToCreate > 0) {
            $discussionCommitteeMembers = User::factory()
                ->count($discussionToCreate)
                ->discussionCommittee()
                ->create();
        } else {
            $discussionCommitteeMembers = User::where('role', 'discussion_committee')->take(6)->get();
        }

        // Create supervisor profiles for discussion committee members (so they have emp_id for login)
        foreach ($discussionCommitteeMembers as $member) {
            $empId = 'EMP' . str_pad((string) fake()->unique()->numberBetween(1000, 9999), 4, '0', STR_PAD_LEFT);
            $profile = Supervisor::firstOrCreate(
                ['user_id' => $member->id],
                [
                    'emp_id' => $empId,
                    'department' => YemeniDataHelper::yemeniDepartment(),
                ]
            );
            // Update username if not set or is temporary
            if (!$member->username || str_starts_with($member->username, 'temp_')) {
                $member->update(['username' => $profile->emp_id]);
            }
        }

        // Create projects committee members (only if we don't have enough)
        $existingProjectsCount = User::where('role', 'projects_committee')->count();
        $projectsToCreate = max(0, 4 - $existingProjectsCount);
        $projectsCommitteeMembers = collect();
        if ($projectsToCreate > 0) {
            $projectsCommitteeMembers = User::factory()
                ->count($projectsToCreate)
                ->projectsCommittee()
                ->create();
        } else {
            $projectsCommitteeMembers = User::where('role', 'projects_committee')->take(4)->get();
        }

        // Create supervisor profiles for projects committee members (so they have emp_id for login)
        foreach ($projectsCommitteeMembers as $member) {
            $empId = 'EMP' . str_pad((string) fake()->unique()->numberBetween(1000, 9999), 4, '0', STR_PAD_LEFT);
            $profile = Supervisor::firstOrCreate(
                ['user_id' => $member->id],
                [
                    'emp_id' => $empId,
                    'department' => YemeniDataHelper::yemeniDepartment(),
                ]
            );
            // Update username if not set or is temporary
            if (!$member->username || str_starts_with($member->username, 'temp_')) {
                $member->update(['username' => $profile->emp_id]);
            }
        }

        $this->command->info('تم إنشاء المستخدمين / Created users:');
        $this->command->info('- 1 مدير / admin');
        $this->command->info('- ' . count($supervisors) . ' مشرف / supervisors');
        $this->command->info('- ' . count($students) . ' طالب / students');
        $this->command->info('- ' . count($discussionCommitteeMembers) . ' عضو لجنة مناقشة / discussion committee members');
        $this->command->info('- ' . count($projectsCommitteeMembers) . ' عضو لجنة المشاريع / projects committee members');
    }
}
