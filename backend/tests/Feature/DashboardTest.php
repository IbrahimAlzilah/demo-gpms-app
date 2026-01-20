<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Project;
use App\Models\Proposal;
use App\Models\ProjectRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_dashboard_requires_authentication(): void
    {
        $response = $this->getJson('/api/student/dashboard');
        $response->assertStatus(401);
    }

    public function test_student_dashboard_requires_student_role(): void
    {
        $supervisor = User::factory()->supervisor()->create();
        
        $response = $this->actingAs($supervisor)->getJson('/api/student/dashboard');
        $response->assertStatus(403);
    }

    public function test_student_dashboard_returns_data(): void
    {
        $student = User::factory()->student()->create();
        
        $response = $this->actingAs($student)->getJson('/api/student/dashboard');
        
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'stats' => [
                    'myProjectStatus',
                    'progressPercentage',
                    'pendingProposals',
                    'pendingRequests',
                    'documentsSubmittedCount',
                    'unreadNotifications',
                ],
                'myProject',
                'activeTimeWindows',
                'timeline' => [
                    'upcomingMilestones',
                    'upcomingMeetings',
                ],
            ],
        ]);
    }

    public function test_supervisor_dashboard_requires_supervisor_role(): void
    {
        $student = User::factory()->student()->create();
        
        $response = $this->actingAs($student)->getJson('/api/supervisor/dashboard');
        $response->assertStatus(403);
    }

    public function test_supervisor_dashboard_returns_data(): void
    {
        $supervisor = User::factory()->supervisor()->create();
        
        $response = $this->actingAs($supervisor)->getJson('/api/supervisor/dashboard');
        
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'stats' => [
                    'supervisedProjectsCount',
                    'pendingSupervisionRequests',
                    'pendingEvaluations',
                    'upcomingMeetingsCount',
                    'overdueMilestonesCount',
                ],
                'upcomingMeetings',
                'overdueMilestones',
                'soonMilestones',
                'projectsNeedingAttention',
            ],
        ]);
    }

    public function test_projects_committee_dashboard_requires_committee_role(): void
    {
        $student = User::factory()->student()->create();
        
        $response = $this->actingAs($student)->getJson('/api/projects-committee/dashboard');
        $response->assertStatus(403);
    }

    public function test_projects_committee_dashboard_returns_data(): void
    {
        $committee = User::factory()->projectsCommittee()->create();
        
        $response = $this->actingAs($committee)->getJson('/api/projects-committee/dashboard');
        
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'stats' => [
                    'pendingProposals',
                    'pendingRequests',
                    'draftProjectsToAnnounce',
                    'projectsWithoutSupervisor',
                    'pendingRegistrations',
                    'gradesPendingApproval',
                ],
                'currentPhase' => [
                    'period',
                    'progressPercent',
                    'endsInDays',
                    'nextPeriod',
                ],
            ],
        ]);
    }

    public function test_discussion_committee_dashboard_requires_committee_role(): void
    {
        $student = User::factory()->student()->create();
        
        $response = $this->actingAs($student)->getJson('/api/discussion-committee/dashboard');
        $response->assertStatus(403);
    }

    public function test_discussion_committee_dashboard_returns_data(): void
    {
        $committee = User::factory()->discussionCommittee()->create();
        
        $response = $this->actingAs($committee)->getJson('/api/discussion-committee/dashboard');
        
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'stats' => [
                    'assignedProjectsCount',
                    'pendingEvaluations',
                    'completedEvaluations',
                    'upcomingScheduleCount',
                ],
                'pendingEvaluations',
                'defenseSchedule',
            ],
        ]);
    }

    public function test_admin_dashboard_requires_admin_role(): void
    {
        $student = User::factory()->student()->create();
        
        $response = $this->actingAs($student)->getJson('/api/admin/dashboard');
        $response->assertStatus(403);
    }

    public function test_admin_dashboard_returns_data(): void
    {
        $admin = User::factory()->admin()->create();
        
        $response = $this->actingAs($admin)->getJson('/api/admin/dashboard');
        
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'stats' => [
                    'usersTotal',
                    'usersActive',
                    'usersByRole',
                    'projectsTotal',
                    'projectsByStatus',
                    'proposalsTotal',
                    'proposalsByStatus',
                    'requestsTotal',
                    'requestsByStatus',
                ],
                'systemHealth' => [
                    'status',
                    'databaseConnected',
                    'timestamp',
                ],
            ],
        ]);
    }
}
