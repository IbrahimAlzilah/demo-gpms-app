<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@gpms.local',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'status' => 'active',
        ]);

        // Create sample supervisor
        User::create([
            'name' => 'Dr. Supervisor',
            'email' => 'supervisor@gpms.local',
            'password' => Hash::make('password'),
            'role' => 'supervisor',
            'emp_id' => 'EMP001',
            'department' => 'Computer Science',
            'status' => 'active',
        ]);

        // Create sample students
        for ($i = 1; $i <= 5; $i++) {
            User::create([
                'name' => "Student {$i}",
                'email' => "student{$i}@gpms.local",
                'password' => Hash::make('password'),
                'role' => 'student',
                'student_id' => "STU00{$i}",
                'department' => 'Computer Science',
                'status' => 'active',
            ]);
        }

        // Create sample committee members
        User::create([
            'name' => 'Committee Member 1',
            'email' => 'committee1@gpms.local',
            'password' => Hash::make('password'),
            'role' => 'discussion_committee',
            'emp_id' => 'EMP002',
            'department' => 'Computer Science',
            'status' => 'active',
        ]);

        User::create([
            'name' => 'Projects Committee Member',
            'email' => 'projects_committee@gpms.local',
            'password' => Hash::make('password'),
            'role' => 'projects_committee',
            'emp_id' => 'EMP003',
            'department' => 'Computer Science',
            'status' => 'active',
        ]);
    }
}
