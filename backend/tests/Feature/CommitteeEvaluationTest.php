<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use App\Models\DefenseEvaluation;
use App\Models\DefenseApproval;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class CommitteeEvaluationTest extends TestCase
{
    use RefreshDatabase;

    public function test_committee_member_can_submit_and_view_own_evaluation()
    {
        // 1. Setup Data
        $supervisor = User::factory()->create(['role' => 'supervisor']);
        $student = User::factory()->create(['role' => 'student']);
        $committeeMember = User::factory()->create(['role' => 'discussion_committee']);
        
        $project = Project::factory()->create([
            'supervisor_id' => $supervisor->id,
            'status' => 'in_progress'
        ]);
        
        // Assign student to project
        $project->students()->attach($student->id);
        
        // Assign committee member to project
        $project->committeeMembers()->attach($committeeMember->id);
        
        Sanctum::actingAs($committeeMember);

        // 2. Submit Evaluation
        $payload = [
            'project_id' => $project->id,
            'student_id' => $student->id,
            'stage' => 'fd1',
            'score' => 85,
            'maxScore' => 100,
            'criteria' => ['presentation' => 10],
            'notes' => 'Good job',
        ];

        $response = $this->postJson('/api/discussion-committee/defense-evaluations', $payload);
        
        $response->assertStatus(200)
            ->assertJson(['success' => true]);
            
        // Verify DB
        $this->assertDatabaseHas('defense_evaluations', [
            'project_id' => $project->id,
            'student_id' => $student->id,
            'evaluator_id' => $committeeMember->id,
            'score' => 85,
        ]);

        // 3. Fetch Evaluation
        $fetchResponse = $this->getJson("/api/discussion-committee/defense-evaluations/my-evaluations?project_id={$project->id}&stage=fd1");
        
        $fetchResponse->assertStatus(200)
            ->assertJson(['success' => true]);
            
        $data = $fetchResponse->json('data');
        
        // Check structure
        $this->assertArrayHasKey('evaluations', $data);
        $this->assertCount(1, $data['evaluations']);
        
        $studentEval = $data['evaluations'][0];
        $this->assertEquals($student->id, $studentEval['student']['id']);
        
        // Check myEvaluation presence
        $this->assertNotNull($studentEval['myEvaluation'], 'myEvaluation should not be null');
        $this->assertEquals(85, $studentEval['myEvaluation']['score']);
    }
}
