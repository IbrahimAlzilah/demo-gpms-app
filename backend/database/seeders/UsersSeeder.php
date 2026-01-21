<?php

namespace Database\Seeders;

use App\Models\Student;
use App\Models\Supervisor;
use App\Models\User;
use Database\Seeders\helpers\YemeniDataHelper;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure exactly 1 admin user
        $existingAdmins = User::where('role', 'admin')->get();
        if ($existingAdmins->isEmpty()) {
            // Create admin user
            $admin = User::create([
                'name' => 'أحمد الأحد',
                'email' => 'admin@gpms.local',
                'username' => 'admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'status' => 'active',
                'phone' => YemeniDataHelper::yemeniPhoneNumber(),
                'email_verified_at' => now(),
            ]);
        } else {
            // Keep only the first admin, delete extras
            $admin = $existingAdmins->first();
            if ($existingAdmins->count() > 1) {
                $existingAdmins->skip(1)->each(function ($extraAdmin) {
                    $extraAdmin->delete();
                });
            }
            // Ensure admin has correct username
            if (!$admin->username || str_starts_with($admin->username, 'temp_')) {
                $admin->update(['username' => 'admin']);
            }
        }

        // Ensure exactly 5 supervisors
        $existingSupervisors = User::where('role', 'supervisor')->get();
        $supervisorsToCreate = max(0, 5 - $existingSupervisors->count());

        // Delete extras if we have more than 5
        if ($existingSupervisors->count() > 5) {
            $existingSupervisors->skip(5)->each(function ($extra) {
                $extra->delete();
            });
            $existingSupervisors = $existingSupervisors->take(5);
        }

        // Create missing supervisors
        $newSupervisors = collect();
        if ($supervisorsToCreate > 0) {
            $newSupervisors = User::factory()
                ->count($supervisorsToCreate)
                ->supervisor()
                ->create();
        }

        $supervisors = $existingSupervisors->merge($newSupervisors);

        // Create/update supervisor profiles
        foreach ($supervisors as $supervisor) {
            $profile = Supervisor::firstOrCreate(
                ['user_id' => $supervisor->id],
                [
                    'emp_id' => 'EMP' . str_pad((string) fake()->unique()->numberBetween(1000, 9999), 4, '0', STR_PAD_LEFT),
                    'department' => YemeniDataHelper::yemeniDepartment(),
                ]
            );
            // Update username if not set or is temporary
            if (!$supervisor->username || str_starts_with($supervisor->username, 'temp_')) {
                $supervisor->update(['username' => $profile->emp_id]);
            }
        }

        // Ensure exactly 10 students with male names
        $existingStudents = User::where('role', 'student')->get();
        $studentsToCreate = max(0, 10 - $existingStudents->count());

        // Delete extras if we have more than 10
        if ($existingStudents->count() > 10) {
            $existingStudents->skip(10)->each(function ($extra) {
                $extra->delete();
            });
            $existingStudents = $existingStudents->take(10);
        }

        // Create missing students with male names
        $newStudents = collect();
        if ($studentsToCreate > 0) {
            for ($i = 0; $i < $studentsToCreate; $i++) {
                $maleName = YemeniDataHelper::yemeniMaleName();
                $emailDomain = YemeniDataHelper::yemeniEmailDomain();
                $emailUsername = Str::slug(explode(' ', $maleName)[0]) . '.' . fake()->unique()->numberBetween(100, 9999);

                $student = User::create([
                    'name' => $maleName,
                    'email' => $emailUsername . '@' . $emailDomain,
                    'username' => 'temp_' . Str::random(10) . '_' . time(),
                    'email_verified_at' => now(),
                    'password' => Hash::make('password'),
                    'role' => 'student',
                    'status' => 'active',
                    'phone' => YemeniDataHelper::yemeniPhoneNumber(),
                ]);
                $newStudents->push($student);
            }
        }

        $students = $existingStudents->merge($newStudents);

        // Create/update student profiles
        foreach ($students as $student) {
            $profile = Student::firstOrCreate(
                ['user_id' => $student->id],
                [
                    'student_id' => 'STU' . str_pad((string) fake()->unique()->numberBetween(1000, 9999), 4, '0', STR_PAD_LEFT),
                    'major' => YemeniDataHelper::yemeniDepartment(),
                    'academic_level' => YemeniDataHelper::yemeniAcademicLevel(),
                ]
            );
            // Update username if not set or is temporary
            if (!$student->username || str_starts_with($student->username, 'temp_')) {
                $student->update(['username' => $profile->student_id]);
            }
        }

        // Ensure exactly 3 discussion committee members
        $existingDiscussion = User::where('role', 'discussion_committee')->get();
        $discussionToCreate = max(0, 3 - $existingDiscussion->count());

        // Delete extras if we have more than 3
        if ($existingDiscussion->count() > 3) {
            $existingDiscussion->skip(3)->each(function ($extra) {
                $extra->delete();
            });
            $existingDiscussion = $existingDiscussion->take(3);
        }

        // Create missing discussion committee members
        $newDiscussion = collect();
        if ($discussionToCreate > 0) {
            $newDiscussion = User::factory()
                ->count($discussionToCreate)
                ->discussionCommittee()
                ->create();
        }

        $discussionCommitteeMembers = $existingDiscussion->merge($newDiscussion);

        // Create/update supervisor profiles for discussion committee members
        foreach ($discussionCommitteeMembers as $member) {
            $profile = Supervisor::firstOrCreate(
                ['user_id' => $member->id],
                [
                    'emp_id' => 'EMP' . str_pad((string) fake()->unique()->numberBetween(1000, 9999), 4, '0', STR_PAD_LEFT),
                    'department' => YemeniDataHelper::yemeniDepartment(),
                ]
            );
            // Update username if not set or is temporary
            if (!$member->username || str_starts_with($member->username, 'temp_')) {
                $member->update(['username' => $profile->emp_id]);
            }
        }

        // Ensure exactly 2 projects committee members
        $existingProjects = User::where('role', 'projects_committee')->get();
        $projectsToCreate = max(0, 2 - $existingProjects->count());

        // Delete extras if we have more than 2
        if ($existingProjects->count() > 2) {
            $existingProjects->skip(2)->each(function ($extra) {
                $extra->delete();
            });
            $existingProjects = $existingProjects->take(2);
        }

        // Create missing projects committee members
        $newProjects = collect();
        if ($projectsToCreate > 0) {
            $newProjects = User::factory()
                ->count($projectsToCreate)
                ->projectsCommittee()
                ->create();
        }

        $projectsCommitteeMembers = $existingProjects->merge($newProjects);

        // Create/update supervisor profiles for projects committee members
        foreach ($projectsCommitteeMembers as $member) {
            $profile = Supervisor::firstOrCreate(
                ['user_id' => $member->id],
                [
                    'emp_id' => 'EMP' . str_pad((string) fake()->unique()->numberBetween(1000, 9999), 4, '0', STR_PAD_LEFT),
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
        $this->command->info('- ' . $supervisors->count() . ' مشرف / supervisors');
        $this->command->info('- ' . $students->count() . ' طالب / students (male names only)');
        $this->command->info('- ' . $discussionCommitteeMembers->count() . ' عضو لجنة مناقشة / discussion committee members');
        $this->command->info('- ' . $projectsCommitteeMembers->count() . ' عضو لجنة المشاريع / projects committee members');
    }
}
