<?php

namespace Tests\Feature\ProjectsCommittee;

use App\Models\User;
use App\Models\Project;
use App\Models\TimePeriod;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ReportsTest extends TestCase
{
    use RefreshDatabase;

    protected User $committeeUser;
    protected User $regularUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a projects committee user
        $this->committeeUser = User::create([
            'name' => 'Test Projects Committee',
            'email' => 'committee@test.local',
            'password' => Hash::make('password'),
            'role' => 'projects_committee',
            'emp_id' => 'EMP003',
            'status' => 'active',
        ]);

        // Create a non-committee user for permission testing
        $this->regularUser = User::create([
            'name' => 'Test Student',
            'email' => 'student@test.local',
            'password' => Hash::make('password'),
            'role' => 'student',
            'student_id' => 'STU001',
            'status' => 'active',
        ]);
    }

    public function test_overview_report_requires_authentication(): void
    {
        $response = $this->getJson('/api/projects-committee/reports/overview');
        $response->assertStatus(401);
    }

    public function test_overview_report_requires_committee_role(): void
    {
        $response = $this->actingAs($this->regularUser)
            ->getJson('/api/projects-committee/reports/overview');

        $response->assertStatus(403);
    }

    public function test_overview_report_returns_data_for_committee(): void
    {
        $response = $this->actingAs($this->committeeUser)
            ->getJson('/api/projects-committee/reports/overview');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'kpis' => [
                        'projects',
                        'proposals',
                        'requests',
                        'students',
                        'evaluations',
                        'milestones',
                    ],
                ],
            ]);
    }

    public function test_overview_report_filters_by_period(): void
    {
        $period = TimePeriod::create([
            'name' => 'Test Period',
            'type' => 'general',
            'start_date' => now()->subMonths(1),
            'end_date' => now()->addMonths(1),
            'is_active' => true,
            'created_by' => $this->committeeUser->id,
        ]);

        $response = $this->actingAs($this->committeeUser)
            ->getJson("/api/projects-committee/reports/overview?period_id={$period->id}");

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_projects_report_returns_data(): void
    {
        // Create some test projects
        for ($i = 0; $i < 5; $i++) {
            Project::create([
                'title' => "Test Project {$i}",
                'description' => "Test Description {$i}",
                'status' => 'draft',
            ]);
        }

        $response = $this->actingAs($this->committeeUser)
            ->getJson('/api/projects-committee/reports/projects');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'summary',
                    'projects',
                    'pagination',
                ],
            ]);
    }

    public function test_supervisors_report_returns_data(): void
    {
        // Create some test supervisors
        for ($i = 0; $i < 3; $i++) {
            User::create([
                'name' => "Test Supervisor {$i}",
                'email' => "supervisor{$i}@test.local",
                'password' => Hash::make('password'),
                'role' => 'supervisor',
                'emp_id' => "EMP{$i}",
                'status' => 'active',
            ]);
        }

        $response = $this->actingAs($this->committeeUser)
            ->getJson('/api/projects-committee/reports/supervisors');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'summary',
                    'supervisors',
                ],
            ]);
    }

    public function test_export_endpoints_require_authentication(): void
    {
        $response = $this->getJson('/api/projects-committee/reports/export/pdf?report=overview');
        $response->assertStatus(401);
    }

    public function test_export_endpoints_require_committee_role(): void
    {
        $response = $this->actingAs($this->regularUser)
            ->getJson('/api/projects-committee/reports/export/pdf?report=overview');

        $response->assertStatus(403);
    }

    public function test_export_pdf_returns_file(): void
    {
        $response = $this->actingAs($this->committeeUser)
            ->get('/api/projects-committee/reports/export/pdf?report=overview');

        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'text/plain; charset=UTF-8')
            ->assertHeader('Content-Disposition');
    }

    public function test_export_excel_returns_file(): void
    {
        $response = $this->actingAs($this->committeeUser)
            ->get('/api/projects-committee/reports/export/excel?report=overview');

        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'text/csv')
            ->assertHeader('Content-Disposition');
    }
}
