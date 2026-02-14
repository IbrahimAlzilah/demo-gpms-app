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
            // Create admin user (password min 8 chars per Settings; email_verified_at set after create - not in User fillable)
            $admin = User::create([
                'name' => 'أحمد الأحد',
                'email' => 'admin@gpms.local',
                'username' => 'admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'status' => 'active',
                'phone' => YemeniDataHelper::yemeniPhoneNumber(),
            ]);
            $admin->update(['email_verified_at' => now()]);
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

        // Create missing supervisors (Arabic male names)
        $newSupervisors = collect();
        if ($supervisorsToCreate > 0) {
            for ($i = 0; $i < $supervisorsToCreate; $i++) {
                $name = YemeniDataHelper::yemeniMaleName();
                $emailDomain = YemeniDataHelper::yemeniEmailDomain();
                $emailUsername = Str::slug(explode(' ', $name)[0]) . '.' . fake()->unique()->numberBetween(100, 9999);
                $user = User::create([
                    'name' => $name,
                    'email' => $emailUsername . '@' . $emailDomain,
                    'username' => 'temp_' . Str::random(10) . '_' . time(),
                    'password' => Hash::make('password'),
                    'role' => 'supervisor',
                    'status' => 'active',
                    'phone' => YemeniDataHelper::yemeniPhoneNumber(),
                ]);
                $user->update(['email_verified_at' => now()]);
                $newSupervisors->push($user);
            }
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

        // Ensure exactly 20 students with male names (Arabic)
        $existingStudents = User::where('role', 'student')->get();
        $studentsToCreate = max(0, 20 - $existingStudents->count());

        // Delete extras if we have more than 20
        if ($existingStudents->count() > 20) {
            $existingStudents->skip(20)->each(function ($extra) {
                $extra->delete();
            });
            $existingStudents = $existingStudents->take(20);
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
                    'password' => Hash::make('password'),
                    'role' => 'student',
                    'status' => 'active',
                    'phone' => YemeniDataHelper::yemeniPhoneNumber(),
                ]);
                $student->update(['email_verified_at' => now()]);
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

        // Ensure exactly 4 discussion committee members (Arabic male names)
        $existingDiscussion = User::where('role', 'discussion_committee')->get();
        $discussionToCreate = max(0, 4 - $existingDiscussion->count());

        // Delete extras if we have more than 4
        if ($existingDiscussion->count() > 4) {
            $existingDiscussion->skip(4)->each(function ($extra) {
                $extra->delete();
            });
            $existingDiscussion = $existingDiscussion->take(4);
        }

        // Create missing discussion committee members
        $newDiscussion = collect();
        if ($discussionToCreate > 0) {
            for ($i = 0; $i < $discussionToCreate; $i++) {
                $name = YemeniDataHelper::yemeniMaleName();
                $emailDomain = YemeniDataHelper::yemeniEmailDomain();
                $emailUsername = Str::slug(explode(' ', $name)[0]) . '.' . fake()->unique()->numberBetween(100, 9999);
                $user = User::create([
                    'name' => $name,
                    'email' => $emailUsername . '@' . $emailDomain,
                    'username' => 'temp_' . Str::random(10) . '_' . time(),
                    'password' => Hash::make('password'),
                    'role' => 'discussion_committee',
                    'status' => 'active',
                    'phone' => YemeniDataHelper::yemeniPhoneNumber(),
                ]);
                $user->update(['email_verified_at' => now()]);
                $newDiscussion->push($user);
            }
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

        // Create missing projects committee members (Arabic male names)
        $newProjects = collect();
        if ($projectsToCreate > 0) {
            for ($i = 0; $i < $projectsToCreate; $i++) {
                $name = YemeniDataHelper::yemeniMaleName();
                $emailDomain = YemeniDataHelper::yemeniEmailDomain();
                $emailUsername = Str::slug(explode(' ', $name)[0]) . '.' . fake()->unique()->numberBetween(100, 9999);
                $user = User::create([
                    'name' => $name,
                    'email' => $emailUsername . '@' . $emailDomain,
                    'username' => 'temp_' . Str::random(10) . '_' . time(),
                    'password' => Hash::make('password'),
                    'role' => 'projects_committee',
                    'status' => 'active',
                    'phone' => YemeniDataHelper::yemeniPhoneNumber(),
                ]);
                $user->update(['email_verified_at' => now()]);
                $newProjects->push($user);
            }
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

        $this->command->info('تم إنشاء المستخدمين (بيانات عربية) / Created users (Arabic demo data):');
        $this->command->info('- 1 مدير / admin');
        $this->command->info('- ' . $supervisors->count() . ' مشرف / supervisors');
        $this->command->info('- ' . $students->count() . ' طالب / students (أسماء ذكور فقط)');
        $this->command->info('- ' . $discussionCommitteeMembers->count() . ' عضو لجنة مناقشة / discussion committee members');
        $this->command->info('- ' . $projectsCommitteeMembers->count() . ' عضو لجنة المشاريع / projects committee members');
    }
}
