<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Project;
use App\Models\Grade;
use App\Models\CommitteeAssignment;
use App\Models\TimePeriod;
use App\Enums\ProjectStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;

class DiscussionCommitteeTest extends TestCase
{
    use RefreshDatabase;

    protected User $committeeMember1;
    protected User $committeeMember2;
    protected User $committeeMember3;
    protected User $unassignedCommitteeMember;
    protected User $supervisor;
    protected User $student;
    protected Project $project;

    protected function setUp(): void
    {
        parent::setUp();

        $this->committeeMember1 = User::factory()->create([
            'role' => 'discussion_committee',
            'status' => 'active',
        ]);

        $this->committeeMember2 = User::factory()->create([
            'role' => 'discussion_committee',
            'status' => 'active',
        ]);

        $this->committeeMember3 = User::factory()->create([
            'role' => 'discussion_committee',
            'status' => 'active',
        ]);

        $this->unassignedCommitteeMember = User::factory()->create([
            'role' => 'discussion_committee',
            'status' => 'active',
        ]);

        $this->supervisor = User::factory()->create([
            'role' => 'supervisor',
            'status' => 'active',
        ]);

        $this->student = User::factory()->create([
            'role' => 'student',
            'status' => 'active',
        ]);

        $this->project = Project::create([
            'title' => 'Test Project',
            'description' => 'Test Description',
            'status' => ProjectStatus::IN_PROGRESS,
            'supervisor_id' => $this->supervisor->id,
            'max_students' => 4,
            'current_students' => 1,
        ]);

        // Assign committee members to project (2-3 members as required)
        CommitteeAssignment::create([
            'project_id' => $this->project->id,
            'committee_member_id' => $this->committeeMember1->id,
        ]);

        CommitteeAssignment::create([
            'project_id' => $this->project->id,
            'committee_member_id' => $this->committeeMember2->id,
        ]);

        // Register student in project
        $this->project->students()->attach($this->student->id);
    }

    /** @test */
    public function discussion_committee_can_view_assigned_projects()
    {
        $response = $this->actingAs($this->committeeMember1)
            ->getJson('/api/discussion-committee/projects');

        $response->assertOk();
        $response->assertJsonStructure([
            'success',
            'data' => [
                '*' => [
                    'id',
                    'title',
                    'description',
                    'status',
                ],
            ],
            'pagination' => [
                'page',
                'pageSize',
                'total',
                'totalPages',
            ],
        ]);

        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals($this->project->id, $data[0]['id']);
    }

    /** @test */
    public function discussion_committee_can_view_assigned_project_details()
    {
        $response = $this->actingAs($this->committeeMember1)
            ->getJson("/api/discussion-committee/projects/{$this->project->id}");

        $response->assertOk();
        $response->assertJsonStructure([
            'success',
            'data' => [
                'id',
                'title',
                'description',
                'status',
                'supervisor',
                'students',
                'grades',
                'committeeMembers',
            ],
        ]);

        $data = $response->json('data');
        $this->assertEquals($this->project->id, $data['id']);
        $this->assertEquals($this->project->title, $data['title']);
    }

    /** @test */
    public function discussion_committee_cannot_view_unassigned_projects()
    {
        $unassignedProject = Project::create([
            'title' => 'Unassigned Project',
            'description' => 'Description',
            'status' => ProjectStatus::IN_PROGRESS,
            'supervisor_id' => $this->supervisor->id,
            'max_students' => 4,
            'current_students' => 0,
        ]);

        $response = $this->actingAs($this->unassignedCommitteeMember)
            ->getJson("/api/discussion-committee/projects/{$unassignedProject->id}");

        $response->assertForbidden();
        $response->assertJson([
            'success' => false,
            'message' => 'Unauthorized',
        ]);
    }

    /** @test */
    public function discussion_committee_can_submit_evaluation_with_snake_case_payload()
    {
        // Create active discussion_evaluation window
        TimePeriod::create([
            'name' => 'Discussion Evaluation Period',
            'type' => 'discussion_evaluation',
            'start_date' => now()->subDays(1),
            'end_date' => now()->addDays(7),
            'is_active' => true,
            'created_by' => $this->supervisor->id,
        ]);

        $response = $this->actingAs($this->committeeMember1)
            ->postJson('/api/discussion-committee/evaluations', [
                'project_id' => $this->project->id,
                'student_id' => $this->student->id,
                'score' => 85,
                'max_score' => 100,
                'criteria' => [
                    'presentation' => 30,
                    'questions' => 30,
                    'documents' => 25,
                    'product' => 15,
                ],
                'comments' => 'Excellent work',
            ]);

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'message' => 'Grade submitted successfully',
        ]);

        // Verify grade was created with committee members from DB
        $this->assertDatabaseHas('grades', [
            'project_id' => $this->project->id,
            'student_id' => $this->student->id,
        ]);

        $grade = Grade::where('project_id', $this->project->id)
            ->where('student_id', $this->student->id)
            ->first();

        $this->assertNotNull($grade);
        $this->assertNotNull($grade->committee_grade);
        $this->assertEquals(85, $grade->committee_grade['score']);
        $this->assertEquals(100, $grade->committee_grade['maxScore']);
        
        // Verify committee members were derived from DB (should include both assigned members)
        $storedMembers = $grade->committee_grade['committeeMembers'];
        $this->assertIsArray($storedMembers);
        $this->assertContains((string) $this->committeeMember1->id, $storedMembers);
        $this->assertContains((string) $this->committeeMember2->id, $storedMembers);
    }

    /** @test */
    public function discussion_committee_can_submit_evaluation_with_frontend_payload_format()
    {
        // Create active discussion_evaluation window
        TimePeriod::create([
            'name' => 'Discussion Evaluation Period',
            'type' => 'discussion_evaluation',
            'start_date' => now()->subDays(1),
            'end_date' => now()->addDays(7),
            'is_active' => true,
            'created_by' => $this->supervisor->id,
        ]);

        // Test frontend format (camelCase + nested grade object)
        $response = $this->actingAs($this->committeeMember1)
            ->postJson('/api/discussion-committee/evaluations', [
                'projectId' => $this->project->id,
                'studentId' => $this->student->id,
                'grade' => [
                    'score' => 90,
                    'maxScore' => 100,
                    'criteria' => [
                        'presentation' => 28,
                        'questions' => 30,
                        'documents' => 22,
                        'product' => 10,
                    ],
                    'comments' => 'Very good presentation',
                ],
            ]);

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'message' => 'Grade submitted successfully',
        ]);

        // Verify grade was created
        $grade = Grade::where('project_id', $this->project->id)
            ->where('student_id', $this->student->id)
            ->first();

        $this->assertNotNull($grade);
        $this->assertEquals(90, $grade->committee_grade['score']);
    }

    /** @test */
    public function discussion_committee_cannot_submit_evaluation_when_window_closed()
    {
        // No active window
        $response = $this->actingAs($this->committeeMember1)
            ->postJson('/api/discussion-committee/evaluations', [
                'project_id' => $this->project->id,
                'student_id' => $this->student->id,
                'score' => 85,
                'max_score' => 100,
                'criteria' => [],
            ]);

        $response->assertStatus(403);
        $response->assertJson([
            'success' => false,
            'error' => 'TIME_WINDOW_CLOSED',
        ]);
    }

    /** @test */
    public function discussion_committee_cannot_submit_evaluation_for_unassigned_project()
    {
        TimePeriod::create([
            'name' => 'Discussion Evaluation Period',
            'type' => 'discussion_evaluation',
            'start_date' => now()->subDays(1),
            'end_date' => now()->addDays(7),
            'is_active' => true,
            'created_by' => $this->supervisor->id,
        ]);

        $unassignedProject = Project::create([
            'title' => 'Unassigned Project',
            'description' => 'Description',
            'status' => ProjectStatus::IN_PROGRESS,
            'supervisor_id' => $this->supervisor->id,
            'max_students' => 4,
            'current_students' => 1,
        ]);

        $response = $this->actingAs($this->unassignedCommitteeMember)
            ->postJson('/api/discussion-committee/evaluations', [
                'project_id' => $unassignedProject->id,
                'student_id' => $this->student->id,
                'score' => 85,
                'max_score' => 100,
                'criteria' => [],
            ]);

        $response->assertForbidden();
        $response->assertJson([
            'success' => false,
            'message' => 'Unauthorized - You are not assigned to this project\'s discussion committee',
        ]);
    }

    /** @test */
    public function discussion_committee_cannot_update_approved_grade()
    {
        TimePeriod::create([
            'name' => 'Discussion Evaluation Period',
            'type' => 'discussion_evaluation',
            'start_date' => now()->subDays(1),
            'end_date' => now()->addDays(7),
            'is_active' => true,
            'created_by' => $this->supervisor->id,
        ]);

        // Create an approved grade
        $grade = Grade::create([
            'project_id' => $this->project->id,
            'student_id' => $this->student->id,
            'supervisor_grade' => ['score' => 80, 'maxScore' => 100],
            'committee_grade' => ['score' => 85, 'maxScore' => 100],
            'final_grade' => 82.5,
            'is_approved' => true,
            'approved_at' => now(),
            'approved_by' => $this->supervisor->id,
        ]);

        $response = $this->actingAs($this->committeeMember1)
            ->postJson('/api/discussion-committee/evaluations', [
                'project_id' => $this->project->id,
                'student_id' => $this->student->id,
                'score' => 90,
                'max_score' => 100,
                'criteria' => [],
            ]);

        $response->assertStatus(400);
        $response->assertJson([
            'success' => false,
            'message' => 'Cannot update grade that has already been approved',
        ]);
    }

    /** @test */
    public function discussion_committee_projects_list_supports_pagination()
    {
        // Create additional projects for pagination testing
        for ($i = 0; $i < 5; $i++) {
            $project = Project::create([
                'title' => "Project {$i}",
                'description' => "Description {$i}",
                'status' => ProjectStatus::IN_PROGRESS,
                'supervisor_id' => $this->supervisor->id,
                'max_students' => 4,
                'current_students' => 0,
            ]);

            CommitteeAssignment::create([
                'project_id' => $project->id,
                'committee_member_id' => $this->committeeMember1->id,
            ]);
        }

        // Test pagination
        $response = $this->actingAs($this->committeeMember1)
            ->getJson('/api/discussion-committee/projects?page=1&pageSize=3');

        $response->assertOk();
        $response->assertJsonStructure([
            'success',
            'data',
            'pagination' => [
                'page',
                'pageSize',
                'total',
                'totalPages',
            ],
        ]);

        $pagination = $response->json('pagination');
        $this->assertEquals(1, $pagination['page']);
        $this->assertEquals(3, $pagination['pageSize']);
        $this->assertGreaterThanOrEqual(6, $pagination['total']); // Original + 5 new
        $this->assertCount(3, $response->json('data')); // Should return 3 items per page
    }

    /** @test */
    public function discussion_committee_projects_list_supports_search()
    {
        $response = $this->actingAs($this->committeeMember1)
            ->getJson('/api/discussion-committee/projects?search=Test');

        $response->assertOk();
        $data = $response->json('data');
        $this->assertGreaterThanOrEqual(1, count($data));
        $this->assertStringContainsString('Test', $data[0]['title']);
    }
}
