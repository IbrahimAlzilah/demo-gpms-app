<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Proposal;
use App\Models\Project;
use App\Models\Grade;
use App\Models\TimePeriod;
use App\Enums\ProposalStatus;
use App\Enums\ProjectStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class StudentRoleTest extends TestCase
{
    use RefreshDatabase;

    protected User $student;
    protected User $supervisor;
    protected User $committeeUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->student = User::factory()->create([
            'role' => 'student',
            'status' => 'active',
        ]);

        $this->supervisor = User::factory()->create([
            'role' => 'supervisor',
            'status' => 'active',
        ]);

        $this->committeeUser = User::factory()->create([
            'role' => 'projects_committee',
            'status' => 'active',
        ]);
    }

    /** @test */
    public function student_can_edit_proposal_with_requires_modification_status()
    {
        // Create active proposal_submission window
        TimePeriod::create([
            'name' => 'Proposal Submission Period',
            'type' => 'proposal_submission',
            'start_date' => now()->subDays(1),
            'end_date' => now()->addDays(7),
            'is_active' => true,
            'created_by' => $this->committeeUser->id,
        ]);

        $proposal = Proposal::create([
            'title' => 'Original Title',
            'description' => 'Original Description',
            'objectives' => 'Original Objectives',
            'submitter_id' => $this->student->id,
            'status' => ProposalStatus::REQUIRES_MODIFICATION->value,
        ]);

        $response = $this->actingAs($this->student)
            ->putJson("/api/student/proposals/{$proposal->id}", [
                'title' => 'Updated Title',
                'description' => 'Updated Description',
                'objectives' => 'Updated Objectives',
            ]);

        $response->assertOk();
        $this->assertDatabaseHas('proposals', [
            'id' => $proposal->id,
            'title' => 'Updated Title',
            'status' => ProposalStatus::PENDING_REVIEW->value, // Status changes back to pending_review
        ]);
    }

    /** @test */
    public function student_cannot_edit_approved_proposal()
    {
        TimePeriod::create([
            'name' => 'Proposal Submission Period',
            'type' => 'proposal_submission',
            'start_date' => now()->subDays(1),
            'end_date' => now()->addDays(7),
            'is_active' => true,
            'created_by' => $this->committeeUser->id,
        ]);

        $proposal = Proposal::create([
            'title' => 'Approved Proposal',
            'description' => 'Description',
            'objectives' => 'Objectives',
            'submitter_id' => $this->student->id,
            'status' => ProposalStatus::APPROVED->value,
        ]);

        $response = $this->actingAs($this->student)
            ->putJson("/api/student/proposals/{$proposal->id}", [
                'title' => 'Trying to Update',
                'description' => 'Description',
                'objectives' => 'Objectives',
            ]);

        $response->assertForbidden();
    }

    /** @test */
    public function student_cannot_upload_document_if_not_registered_in_project()
    {
        Storage::fake('documents');

        TimePeriod::create([
            'name' => 'Document Submission Period',
            'type' => 'document_submission',
            'start_date' => now()->subDays(1),
            'end_date' => now()->addDays(7),
            'is_active' => true,
            'created_by' => $this->committeeUser->id,
        ]);

        $project = Project::create([
            'title' => 'Test Project',
            'description' => 'Description',
            'status' => ProjectStatus::IN_PROGRESS,
            'supervisor_id' => $this->supervisor->id,
            'max_students' => 4,
            'current_students' => 0,
        ]);

        $file = UploadedFile::fake()->create('document.pdf', 1000);

        $response = $this->actingAs($this->student)
            ->postJson('/api/student/documents', [
                'project_id' => $project->id,
                'file' => $file,
                'type' => 'final_report',
            ]);

        $response->assertForbidden();
        $response->assertJson([
            'success' => false,
            'message' => 'You must be registered in this project to upload documents',
        ]);
    }

    /** @test */
    public function student_can_upload_document_when_registered_in_project()
    {
        Storage::fake('documents');

        TimePeriod::create([
            'name' => 'Document Submission Period',
            'type' => 'document_submission',
            'start_date' => now()->subDays(1),
            'end_date' => now()->addDays(7),
            'is_active' => true,
            'created_by' => $this->committeeUser->id,
        ]);

        $project = Project::create([
            'title' => 'Test Project',
            'description' => 'Description',
            'status' => ProjectStatus::IN_PROGRESS,
            'supervisor_id' => $this->supervisor->id,
            'max_students' => 4,
            'current_students' => 1,
        ]);

        // Register student in project
        $project->students()->attach($this->student->id);

        $file = UploadedFile::fake()->create('document.pdf', 1000);

        $response = $this->actingAs($this->student)
            ->postJson('/api/student/documents', [
                'project_id' => $project->id,
                'file' => $file,
                'type' => 'final_report',
            ]);

        $response->assertCreated();
        $this->assertDatabaseHas('documents', [
            'project_id' => $project->id,
            'submitted_by' => $this->student->id,
            'type' => 'final_report',
        ]);
    }

    /** @test */
    public function student_can_only_view_approved_grades()
    {
        $project = Project::create([
            'title' => 'Test Project',
            'description' => 'Description',
            'status' => ProjectStatus::COMPLETED,
            'supervisor_id' => $this->supervisor->id,
            'max_students' => 4,
            'current_students' => 1,
        ]);

        // Create approved grade
        Grade::create([
            'project_id' => $project->id,
            'student_id' => $this->student->id,
            'supervisor_grade' => ['score' => 80, 'maxScore' => 100],
            'committee_grade' => ['score' => 85, 'maxScore' => 100],
            'final_grade' => 82.5,
            'is_approved' => true,
            'approved_at' => now(),
            'approved_by' => $this->committeeUser->id,
        ]);

        // Create unapproved grade
        Grade::create([
            'project_id' => $project->id,
            'student_id' => $this->student->id,
            'supervisor_grade' => ['score' => 70, 'maxScore' => 100],
            'final_grade' => 70,
            'is_approved' => false,
        ]);

        $response = $this->actingAs($this->student)
            ->getJson('/api/student/grades');

        $response->assertOk();
        $responseData = $response->json('data');
        
        // Should only return 1 grade (the approved one)
        $this->assertCount(1, $responseData);
        $this->assertEquals(82.5, $responseData[0]['finalGrade']);
    }

    /** @test */
    public function time_window_middleware_blocks_proposal_submission_when_window_closed()
    {
        $proposal = [
            'title' => 'Test Proposal',
            'description' => 'This is a test description with enough characters to pass validation',
            'objectives' => 'These are the test objectives for the proposal',
        ];

        // No active time window
        $response = $this->actingAs($this->student)
            ->postJson('/api/student/proposals', $proposal);

        $response->assertStatus(403);
        $response->assertJson([
            'success' => false,
            'error' => 'TIME_WINDOW_CLOSED',
        ]);
    }

    /** @test */
    public function time_window_middleware_allows_proposal_submission_when_window_open()
    {
        TimePeriod::create([
            'name' => 'Proposal Submission Period',
            'type' => 'proposal_submission',
            'start_date' => now()->subDays(1),
            'end_date' => now()->addDays(7),
            'is_active' => true,
            'created_by' => $this->committeeUser->id,
        ]);

        $proposal = [
            'title' => 'Test Proposal',
            'description' => 'This is a test description with enough characters to pass validation',
            'objectives' => 'These are the test objectives for the proposal',
        ];

        $response = $this->actingAs($this->student)
            ->postJson('/api/student/proposals', $proposal);

        $response->assertCreated();
        $this->assertDatabaseHas('proposals', [
            'title' => 'Test Proposal',
            'submitter_id' => $this->student->id,
            'status' => ProposalStatus::PENDING_REVIEW->value,
        ]);
    }

    /** @test */
    public function projects_committee_bypasses_time_window_restrictions()
    {
        // No active time window
        $proposal = [
            'title' => 'Committee Proposal',
            'description' => 'This is a committee proposal with enough characters',
            'objectives' => 'Committee objectives for testing bypass',
        ];

        // Committee should still be able to create proposals
        $response = $this->actingAs($this->committeeUser)
            ->postJson('/api/supervisor/proposals', $proposal);

        $response->assertCreated();
    }
}
