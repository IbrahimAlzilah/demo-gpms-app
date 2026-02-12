<?php

namespace Tests\Feature;

use App\Models\CommitteeAssignment;
use App\Models\DefenseApproval;
use App\Models\DefenseEvaluation;
use App\Models\Project;
use App\Models\User;
use App\Enums\ProjectStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DefenseEvaluationTest extends TestCase
{
    use RefreshDatabase;

    protected User $committeeMember1;
    protected User $committeeMember2;
    protected User $supervisor;
    protected User $student;
    protected User $projectsCommitteeUser;
    protected Project $project;

    protected function setUp(): void
    {
        parent::setUp();

        $this->committeeMember1 = User::factory()->create([
            'role' => 'discussion_committee',
            'status' => 'active',
            'name' => 'Committee Member 1',
        ]);

        $this->committeeMember2 = User::factory()->create([
            'role' => 'discussion_committee',
            'status' => 'active',
            'name' => 'Committee Member 2',
        ]);

        $this->supervisor = User::factory()->create([
            'role' => 'supervisor',
            'status' => 'active',
            'name' => 'Supervisor One',
        ]);

        $this->student = User::factory()->create([
            'role' => 'student',
            'status' => 'active',
            'name' => 'Student One',
        ]);

        $this->projectsCommitteeUser = User::factory()->create([
            'role' => 'projects_committee',
            'status' => 'active',
            'name' => 'Project Committee User',
        ]);

        $this->project = Project::create([
            'title' => 'Defense Test Project',
            'description' => 'Description',
            'status' => ProjectStatus::IN_PROGRESS,
            'supervisor_id' => $this->supervisor->id,
            'max_students' => 4,
            'current_students' => 1,
        ]);

        $this->project->students()->attach($this->student->id);

        CommitteeAssignment::create([
            'project_id' => $this->project->id,
            'committee_member_id' => $this->committeeMember1->id,
        ]);
        CommitteeAssignment::create([
            'project_id' => $this->project->id,
            'committee_member_id' => $this->committeeMember2->id,
        ]);
    }

    /** @test */
    public function committee_member_sees_only_own_evaluations_not_others(): void
    {
        // Member 1 submits FD1 evaluation for student
        $this->actingAs($this->committeeMember1)
            ->postJson('/api/discussion-committee/defense-evaluations', [
                'project_id' => $this->project->id,
                'student_id' => $this->student->id,
                'stage' => 'fd1',
                'score' => 85,
                'maxScore' => 100,
                'notes' => 'Good work',
            ])
            ->assertOk();

        // Member 2 submits FD1 evaluation for same student
        $this->actingAs($this->committeeMember2)
            ->postJson('/api/discussion-committee/defense-evaluations', [
                'project_id' => $this->project->id,
                'student_id' => $this->student->id,
                'stage' => 'fd1',
                'score' => 90,
                'maxScore' => 100,
            ])
            ->assertOk();

        // Member 1 gets "my evaluations" - must see only their 85, not 90
        $response = $this->actingAs($this->committeeMember1)
            ->getJson('/api/discussion-committee/defense-evaluations/my-evaluations?' . http_build_query([
                'project_id' => $this->project->id,
                'stage' => 'fd1',
            ]));

        $response->assertOk();
        $evaluations = $response->json('data.evaluations');
        $this->assertCount(1, $evaluations);
        $this->assertEquals(85, $evaluations[0]['myEvaluation']['score']);
        $this->assertArrayNotHasKey('committeeEvaluations', $evaluations[0]);
    }

    /** @test */
    public function committee_member_cannot_submit_for_unassigned_project(): void
    {
        $otherProject = Project::create([
            'title' => 'Other Project',
            'description' => 'Other',
            'status' => ProjectStatus::IN_PROGRESS,
            'supervisor_id' => $this->supervisor->id,
            'max_students' => 4,
            'current_students' => 1,
        ]);
        $otherProject->students()->attach($this->student->id);

        $response = $this->actingAs($this->committeeMember1)
            ->postJson('/api/discussion-committee/defense-evaluations', [
                'project_id' => $otherProject->id,
                'student_id' => $this->student->id,
                'stage' => 'fd1',
                'score' => 80,
            ]);

        $response->assertStatus(400);
        $this->assertStringContainsString('not assigned', $response->json('message'));
    }

    /** @test */
    public function fd1_and_fd2_evaluations_are_stored_separately(): void
    {
        // Supervisor submits FD1
        $this->actingAs($this->supervisor)
            ->postJson('/api/supervisor/defense-evaluations', [
                'project_id' => $this->project->id,
                'student_id' => $this->student->id,
                'stage' => 'fd1',
                'score' => 75,
            ])
            ->assertOk();

        // Supervisor submits FD2 (different grade)
        $this->actingAs($this->supervisor)
            ->postJson('/api/supervisor/defense-evaluations', [
                'project_id' => $this->project->id,
                'student_id' => $this->student->id,
                'stage' => 'fd2',
                'score' => 88,
            ])
            ->assertOk();

        $fd1Count = DefenseEvaluation::where('project_id', $this->project->id)
            ->where('defense_stage', 'fd1')
            ->count();
        $fd2Count = DefenseEvaluation::where('project_id', $this->project->id)
            ->where('defense_stage', 'fd2')
            ->count();

        $this->assertEquals(1, $fd1Count);
        $this->assertEquals(1, $fd2Count);

        $fd1Eval = DefenseEvaluation::where('project_id', $this->project->id)
            ->where('defense_stage', 'fd1')
            ->first();
        $fd2Eval = DefenseEvaluation::where('project_id', $this->project->id)
            ->where('defense_stage', 'fd2')
            ->first();

        $this->assertEquals(75, $fd1Eval->score);
        $this->assertEquals(88, $fd2Eval->score);
    }

    /** @test */
    public function project_committee_can_view_all_evaluations_for_review(): void
    {
        $this->actingAs($this->supervisor)
            ->postJson('/api/supervisor/defense-evaluations', [
                'project_id' => $this->project->id,
                'student_id' => $this->student->id,
                'stage' => 'fd1',
                'score' => 80,
            ])
            ->assertOk();

        $this->actingAs($this->committeeMember1)
            ->postJson('/api/discussion-committee/defense-evaluations', [
                'project_id' => $this->project->id,
                'student_id' => $this->student->id,
                'stage' => 'fd1',
                'score' => 85,
            ])
            ->assertOk();

        $response = $this->actingAs($this->projectsCommitteeUser)
            ->getJson("/api/projects-committee/defense-evaluations/{$this->project->id}/review/fd1");

        $response->assertOk();
        $evaluations = $response->json('data.evaluations');
        $this->assertCount(1, $evaluations);
        $this->assertNotNull($evaluations[0]['supervisorEvaluation']);
        $this->assertCount(1, $evaluations[0]['committeeEvaluations']);
        $this->assertEquals(80, $evaluations[0]['supervisorEvaluation']['score']);
        $this->assertEquals(85, $evaluations[0]['committeeEvaluations'][0]['score']);
    }

    /** @test */
    public function evaluation_is_locked_after_stage_published(): void
    {
        $this->actingAs($this->committeeMember1)
            ->postJson('/api/discussion-committee/defense-evaluations', [
                'project_id' => $this->project->id,
                'student_id' => $this->student->id,
                'stage' => 'fd1',
                'score' => 85,
            ])
            ->assertOk();

        $evaluation = DefenseEvaluation::where('project_id', $this->project->id)
            ->where('evaluator_id', $this->committeeMember1->id)
            ->where('defense_stage', 'fd1')
            ->first();

        // Approve then publish FD1
        DefenseApproval::create([
            'project_id' => $this->project->id,
            'defense_stage' => 'fd1',
            'status' => 'approved',
            'approved_by' => $this->projectsCommitteeUser->id,
            'approved_at' => now(),
        ]);

        $approval = DefenseApproval::where('project_id', $this->project->id)
            ->where('defense_stage', 'fd1')
            ->first();
        $approval->status = 'published';
        $approval->published_by = $this->projectsCommitteeUser->id;
        $approval->published_at = now();
        $approval->save();

        // Committee member tries to update their evaluation after publish
        $response = $this->actingAs($this->committeeMember1)
            ->putJson("/api/discussion-committee/defense-evaluations/{$evaluation->id}", [
                'score' => 90,
            ]);

        $response->assertStatus(400);
        $this->assertStringContainsString('locked', strtolower($response->json('message')));
    }

    /** @test */
    public function committee_member_cannot_update_another_members_evaluation(): void
    {
        $this->actingAs($this->committeeMember1)
            ->postJson('/api/discussion-committee/defense-evaluations', [
                'project_id' => $this->project->id,
                'student_id' => $this->student->id,
                'stage' => 'fd1',
                'score' => 85,
            ])
            ->assertOk();

        $evalByMember1 = DefenseEvaluation::where('project_id', $this->project->id)
            ->where('evaluator_id', $this->committeeMember1->id)
            ->where('defense_stage', 'fd1')
            ->first();

        // Member 2 tries to update Member 1's evaluation
        $response = $this->actingAs($this->committeeMember2)
            ->putJson("/api/discussion-committee/defense-evaluations/{$evalByMember1->id}", [
                'score' => 90,
            ]);

        $response->assertStatus(403);
        $this->assertStringContainsString('own', strtolower($response->json('message')));
    }
}
