<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

class AuthLoginTest extends TestCase
{
    use RefreshDatabase;

    protected User $student;
    protected User $supervisor;
    protected User $discussionCommittee;
    protected User $projectsCommittee;
    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->student = User::create([
            'name' => 'Test Student',
            'email' => 'student@test.local',
            'password' => Hash::make('password'),
            'role' => 'student',
            'student_id' => 'STU001',
            'status' => 'active',
        ]);

        $this->supervisor = User::create([
            'name' => 'Test Supervisor',
            'email' => 'supervisor@test.local',
            'password' => Hash::make('password'),
            'role' => 'supervisor',
            'emp_id' => 'EMP001',
            'status' => 'active',
        ]);

        $this->discussionCommittee = User::create([
            'name' => 'Test Discussion Committee',
            'email' => 'discussion@test.local',
            'password' => Hash::make('password'),
            'role' => 'discussion_committee',
            'emp_id' => 'EMP002',
            'status' => 'active',
        ]);

        $this->projectsCommittee = User::create([
            'name' => 'Test Projects Committee',
            'email' => 'projects@test.local',
            'password' => Hash::make('password'),
            'role' => 'projects_committee',
            'emp_id' => 'EMP003',
            'status' => 'active',
        ]);

        $this->admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@test.local',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'status' => 'active',
        ]);
    }

    /** @test */
    public function student_can_login_with_student_id()
    {
        $response = $this->postJson('/api/auth/login', [
            'identifier' => 'STU001',
            'password' => 'password',
        ]);

        $response->assertOk();
        $response->assertJsonStructure([
            'success',
            'data' => [
                'token',
                'user' => [
                    'id',
                    'name',
                    'email',
                    'role',
                    'studentId',
                ],
                'permissions',
            ],
        ]);

        $response->assertJson([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => (string) $this->student->id,
                    'role' => 'student',
                    'studentId' => 'STU001',
                ],
            ],
        ]);
    }

    /** @test */
    public function supervisor_can_login_with_emp_id()
    {
        $response = $this->postJson('/api/auth/login', [
            'identifier' => 'EMP001',
            'password' => 'password',
        ]);

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => (string) $this->supervisor->id,
                    'role' => 'supervisor',
                    'empId' => 'EMP001',
                ],
            ],
        ]);
    }

    /** @test */
    public function discussion_committee_can_login_with_emp_id()
    {
        $response = $this->postJson('/api/auth/login', [
            'identifier' => 'EMP002',
            'password' => 'password',
        ]);

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => (string) $this->discussionCommittee->id,
                    'role' => 'discussion_committee',
                    'empId' => 'EMP002',
                ],
            ],
        ]);
    }

    /** @test */
    public function projects_committee_can_login_with_emp_id()
    {
        $response = $this->postJson('/api/auth/login', [
            'identifier' => 'EMP003',
            'password' => 'password',
        ]);

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => (string) $this->projectsCommittee->id,
                    'role' => 'projects_committee',
                    'empId' => 'EMP003',
                ],
            ],
        ]);
    }

    /** @test */
    public function admin_can_login_with_admin_identifier()
    {
        $response = $this->postJson('/api/auth/login', [
            'identifier' => 'admin',
            'password' => 'password',
        ]);

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => (string) $this->admin->id,
                    'role' => 'admin',
                ],
            ],
        ]);
    }

    /** @test */
    public function admin_can_login_with_admin_identifier_case_insensitive()
    {
        $response = $this->postJson('/api/auth/login', [
            'identifier' => 'ADMIN',
            'password' => 'password',
        ]);

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => (string) $this->admin->id,
                    'role' => 'admin',
                ],
            ],
        ]);
    }

    /** @test */
    public function admin_cannot_login_with_email()
    {
        $response = $this->postJson('/api/auth/login', [
            'identifier' => 'admin@test.local',
            'password' => 'password',
        ]);

        $response->assertStatus(401);
        $response->assertJson([
            'success' => false,
            'message' => 'Invalid credentials',
        ]);
    }

    /** @test */
    public function student_cannot_login_with_staff_emp_id()
    {
        $response = $this->postJson('/api/auth/login', [
            'identifier' => 'EMP001',
            'password' => 'password',
        ]);

        // Should login as supervisor, not student
        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'data' => [
                'user' => [
                    'role' => 'supervisor',
                ],
            ],
        ]);
    }

    /** @test */
    public function staff_cannot_login_with_student_id()
    {
        $response = $this->postJson('/api/auth/login', [
            'identifier' => 'STU001',
            'password' => 'password',
        ]);

        // Should login as student, not staff
        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'data' => [
                'user' => [
                    'role' => 'student',
                ],
            ],
        ]);
    }

    /** @test */
    public function login_fails_with_invalid_identifier()
    {
        $response = $this->postJson('/api/auth/login', [
            'identifier' => 'INVALID123',
            'password' => 'password',
        ]);

        $response->assertStatus(401);
        $response->assertJson([
            'success' => false,
            'message' => 'Invalid credentials',
        ]);
    }

    /** @test */
    public function login_fails_with_invalid_password()
    {
        $response = $this->postJson('/api/auth/login', [
            'identifier' => 'STU001',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401);
        $response->assertJson([
            'success' => false,
            'message' => 'Invalid credentials',
        ]);
    }

    /** @test */
    public function login_fails_with_missing_identifier()
    {
        $response = $this->postJson('/api/auth/login', [
            'password' => 'password',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['identifier']);
    }

    /** @test */
    public function login_fails_with_missing_password()
    {
        $response = $this->postJson('/api/auth/login', [
            'identifier' => 'STU001',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password']);
    }

    /** @test */
    public function login_fails_for_inactive_user()
    {
        $inactiveStudent = User::create([
            'name' => 'Inactive Student',
            'email' => 'inactive@test.local',
            'password' => Hash::make('password'),
            'role' => 'student',
            'student_id' => 'STU999',
            'status' => 'inactive',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'identifier' => 'STU999',
            'password' => 'password',
        ]);

        $response->assertStatus(403);
        $response->assertJson([
            'success' => false,
            'message' => 'Account is not active',
        ]);
    }

    /** @test */
    public function login_returns_permissions_for_student()
    {
        $response = $this->postJson('/api/auth/login', [
            'identifier' => 'STU001',
            'password' => 'password',
        ]);

        $response->assertOk();
        $data = $response->json('data');
        $this->assertIsArray($data['permissions']);
        $this->assertNotEmpty($data['permissions']);
    }

    /** @test */
    public function login_returns_permissions_for_admin()
    {
        $response = $this->postJson('/api/auth/login', [
            'identifier' => 'admin',
            'password' => 'password',
        ]);

        $response->assertOk();
        $data = $response->json('data');
        $this->assertIsArray($data['permissions']);
        $this->assertNotEmpty($data['permissions']);
    }
}
