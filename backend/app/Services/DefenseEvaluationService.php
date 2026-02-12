<?php

namespace App\Services;

use App\Models\DefenseEvaluation;
use App\Models\DefenseApproval;
use App\Models\Grade;
use App\Models\Project;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

class DefenseEvaluationService
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    /**
     * Submit supervisor evaluation for a defense stage
     */
    public function submitSupervisorEvaluation(
        Project $project,
        User $student,
        string $stage, // 'fd1' or 'fd2'
        array $data,
        User $supervisor
    ): DefenseEvaluation {
        // Validate stage
        if (!in_array($stage, ['fd1', 'fd2'])) {
            throw new \Exception('Invalid defense stage. Must be fd1 or fd2.');
        }

        // Validate supervisor ownership
        if ($project->supervisor_id !== $supervisor->id) {
            throw new \Exception('Unauthorized to grade this project.');
        }

        // Check if stage is locked
        $this->ensureStageNotLocked($project, $stage);

        return DB::transaction(function () use ($project, $student, $stage, $data, $supervisor) {
            $evaluation = DefenseEvaluation::updateOrCreate(
                [
                    'project_id' => $project->id,
                    'student_id' => $student->id,
                    'evaluator_id' => $supervisor->id,
                    'defense_stage' => $stage,
                ],
                [
                    'evaluator_role' => 'supervisor',
                    'score' => $data['score'],
                    'max_score' => $data['maxScore'] ?? 100,
                    'criteria' => $data['criteria'] ?? [],
                    'notes' => $data['notes'] ?? null,
                    'created_by' => $supervisor->id,
                    'modified_by' => $supervisor->id,
                ]
            );

            // Update the aggregated grade in grades table
            $this->updateAggregatedGrade($project, $student, $stage);

            $this->maybeNotifyProjectCommitteeEvaluationsReady($project, $stage);

            return $evaluation->fresh();
        });
    }

    /**
     * Submit committee member evaluation (independent, cannot see others)
     */
    public function submitCommitteeMemberEvaluation(
        Project $project,
        User $student,
        User $committeeMember,
        string $stage,
        array $data
    ): DefenseEvaluation {
        // Validate stage
        if (!in_array($stage, ['fd1', 'fd2'])) {
            throw new \Exception('Invalid defense stage. Must be fd1 or fd2.');
        }

        // Validate committee assignment
        $isAssigned = $project->committeeMembers()->where('users.id', $committeeMember->id)->exists();
        if (!$isAssigned) {
            throw new \Exception('You are not assigned to this project\'s defense committee.');
        }

        // Check if stage is locked
        $this->ensureStageNotLocked($project, $stage);

        return DB::transaction(function () use ($project, $student, $committeeMember, $stage, $data) {
            $evaluation = DefenseEvaluation::updateOrCreate(
                [
                    'project_id' => $project->id,
                    'student_id' => $student->id,
                    'evaluator_id' => $committeeMember->id,
                    'defense_stage' => $stage,
                ],
                [
                    'evaluator_role' => 'committee_member',
                    'score' => $data['score'],
                    'max_score' => $data['maxScore'] ?? 100,
                    'criteria' => $data['criteria'] ?? [],
                    'notes' => $data['notes'] ?? null,
                    'created_by' => $committeeMember->id,
                    'modified_by' => $committeeMember->id,
                ]
            );

            // Update the aggregated grade in grades table
            $this->updateAggregatedGrade($project, $student, $stage);

            $this->maybeNotifyProjectCommitteeEvaluationsReady($project, $stage);

            return $evaluation->fresh();
        });
    }

    /**
     * Get a committee member's own evaluation (cannot see others)
     */
    public function getCommitteeMemberEvaluation(
        Project $project,
        User $student,
        User $committeeMember,
        string $stage
    ): ?DefenseEvaluation {
        return DefenseEvaluation::where('project_id', $project->id)
            ->where('student_id', $student->id)
            ->where('evaluator_id', $committeeMember->id)
            ->where('defense_stage', $stage)
            ->first();
    }

    /**
     * Committee members cannot see other members' grades until stage is approved
     */
    public function canCommitteeMemberSeeOtherGrades(Project $project, string $stage): bool
    {
        $approval = DefenseApproval::where('project_id', $project->id)
            ->where('defense_stage', $stage)
            ->first();

        return $approval && in_array($approval->status, ['approved', 'published']);
    }

    /**
     * Get all evaluations for PROJECT COMMITTEE review
     */
    public function getAllEvaluationsForReview(Project $project, string $stage): Collection
    {
        return DefenseEvaluation::where('project_id', $project->id)
            ->where('defense_stage', $stage)
            ->with(['student', 'evaluator'])
            ->orderBy('student_id')
            ->orderBy('evaluator_role')
            ->get();
    }

    /**
     * Update an existing evaluation (Project Committee only, or evaluator before approval)
     */
    public function updateEvaluation(
        DefenseEvaluation $evaluation,
        array $data,
        User $modifier
    ): DefenseEvaluation {
        // Check permissions
        if (!$evaluation->canModify($modifier)) {
            throw new \Exception('You cannot modify this evaluation.');
        }

        return DB::transaction(function () use ($evaluation, $data, $modifier) {
            $evaluation->update([
                'score' => $data['score'] ?? $evaluation->score,
                'max_score' => $data['maxScore'] ?? $evaluation->max_score,
                'criteria' => $data['criteria'] ?? $evaluation->criteria,
                'notes' => $data['notes'] ?? $evaluation->notes,
                'modified_by' => $modifier->id,
            ]);

            // Update aggregated grade
            $this->updateAggregatedGrade(
                $evaluation->project,
                $evaluation->student,
                $evaluation->defense_stage
            );

            return $evaluation->fresh();
        });
    }

    /**
     * Add a new evaluation (Project Committee adjustment)
     */
    public function addProjectCommitteeEvaluation(
        Project $project,
        User $student,
        string $stage,
        array $data,
        User $committeeUser
    ): DefenseEvaluation {
        // Validate stage
        if (!in_array($stage, ['fd1', 'fd2'])) {
            throw new \Exception('Invalid defense stage. Must be fd1 or fd2.');
        }

        // Validate role
        if (!$committeeUser->isProjectsCommittee()) {
            throw new \Exception('Only project committee members can add adjustments.');
        }

        return DB::transaction(function () use ($project, $student, $stage, $data, $committeeUser) {
            $evaluation = DefenseEvaluation::create([
                'project_id' => $project->id,
                'student_id' => $student->id,
                'evaluator_id' => $committeeUser->id,
                'evaluator_role' => 'project_committee',
                'defense_stage' => $stage,
                'score' => $data['score'],
                'max_score' => $data['maxScore'] ?? 100,
                'criteria' => $data['criteria'] ?? [],
                'notes' => $data['notes'] ?? null,
                'created_by' => $committeeUser->id,
                'modified_by' => $committeeUser->id,
            ]);

            // Update aggregated grade
            $this->updateAggregatedGrade($project, $student, $stage);

            return $evaluation->fresh();
        });
    }

    /**
     * Delete an evaluation (Project Committee only)
     */
    public function deleteEvaluation(DefenseEvaluation $evaluation, User $deleter): bool
    {
        if (!$deleter->isProjectsCommittee()) {
            throw new \Exception('Only project committee members can delete evaluations.');
        }

        // Cannot delete if stage is published
        $approval = DefenseApproval::where('project_id', $evaluation->project_id)
            ->where('defense_stage', $evaluation->defense_stage)
            ->first();

        if ($approval && $approval->status === 'published') {
            throw new \Exception('Cannot delete evaluations after stage is published.');
        }

        return DB::transaction(function () use ($evaluation) {
            $project = $evaluation->project;
            $student = $evaluation->student;
            $stage = $evaluation->defense_stage;

            $evaluation->delete();

            // Update aggregated grade
            $this->updateAggregatedGrade($project, $student, $stage);

            return true;
        });
    }

    /**
     * Approve a defense stage (marks it as reviewed and approved)
     */
    public function approveStage(Project $project, string $stage, User $approver): DefenseApproval
    {
        if (!$approver->isProjectsCommittee()) {
            throw new \Exception('Only project committee members can approve stages.');
        }

        if (!in_array($stage, ['fd1', 'fd2'])) {
            throw new \Exception('Invalid defense stage.');
        }

        return DB::transaction(function () use ($project, $stage, $approver) {
            $approval = DefenseApproval::firstOrNew([
                'project_id' => $project->id,
                'defense_stage' => $stage,
            ]);

            if ($approval->status === 'approved' || $approval->status === 'published') {
                throw new \Exception('This stage has already been approved.');
            }

            $approval->status = 'approved';
            $approval->approved_by = $approver->id;
            $approval->approved_at = now();
            $approval->save();

            // Update grades table approved flag
            $this->updateGradesApprovalStatus($project, $stage, true);

            return $approval->fresh();
        });
    }

    /**
     * Publish results (makes them visible to students)
     */
    public function publishResults(Project $project, string $stage, User $publisher): DefenseApproval
    {
        if (!$publisher->isProjectsCommittee()) {
            throw new \Exception('Only project committee members can publish results.');
        }

        if (!in_array($stage, ['fd1', 'fd2'])) {
            throw new \Exception('Invalid defense stage.');
        }

        return DB::transaction(function () use ($project, $stage, $publisher) {
            $approval = DefenseApproval::where('project_id', $project->id)
                ->where('defense_stage', $stage)
                ->first();

            if (!$approval) {
                throw new \Exception('Stage must be approved before publishing.');
            }

            if ($approval->status !== 'approved') {
                throw new \Exception('Can only publish approved stages.');
            }

            $approval->status = 'published';
            $approval->published_by = $publisher->id;
            $approval->published_at = now();
            $approval->save();

            // Update grades table published flag
            $this->updateGradesPublishedStatus($project, $stage, true);

            return $approval->fresh();
        });
    }

    /**
     * Calculate final grade for a student in a defense stage
     */
    public function calculateStudentFinalGrade(Project $project, User $student, string $stage): ?float
    {
        $evaluations = DefenseEvaluation::where('project_id', $project->id)
            ->where('student_id', $student->id)
            ->where('defense_stage', $stage)
            ->get();

        if ($evaluations->isEmpty()) {
            return null;
        }

        // Separate by role
        $supervisorEval = $evaluations->where('evaluator_role', 'supervisor')->first();
        $committeeEvals = $evaluations->where('evaluator_role', 'committee_member');
        $projectCommitteeEvals = $evaluations->where('evaluator_role', 'project_committee');

        $supervisorScore = $supervisorEval ? $supervisorEval->normalized_score : null;
        $committeeAvg = $committeeEvals->isNotEmpty() ? $committeeEvals->avg('normalized_score') : null;

        // If project committee added evaluations, include them
        if ($projectCommitteeEvals->isNotEmpty()) {
            $projectCommitteeAvg = $projectCommitteeEvals->avg('normalized_score');
            
            // Weight: 40% supervisor, 40% committee, 20% project committee
            if ($supervisorScore !== null && $committeeAvg !== null) {
                return round(($supervisorScore * 0.4) + ($committeeAvg * 0.4) + ($projectCommitteeAvg * 0.2), 2);
            }
        }

        // Default: 40% supervisor, 60% committee
        if ($supervisorScore !== null && $committeeAvg !== null) {
            return round(($supervisorScore * 0.4) + ($committeeAvg * 0.6), 2);
        }

        return $supervisorScore ?? $committeeAvg;
    }

    /**
     * Update the aggregated grade in the grades table
     */
    protected function updateAggregatedGrade(Project $project, User $student, string $stage): void
    {
        $grade = Grade::firstOrCreate([
            'project_id' => $project->id,
            'student_id' => $student->id,
        ]);

        $finalGrade = $this->calculateStudentFinalGrade($project, $student, $stage);

        if ($stage === 'fd1') {
            $grade->fd1_final_grade = $finalGrade;
        } else {
            $grade->fd2_final_grade = $finalGrade;
        }

        $grade->save();
    }

    /**
     * Update grades table approval status
     */
    protected function updateGradesApprovalStatus(Project $project, string $stage, bool $approved): void
    {
        $column = $stage === 'fd1' ? 'fd1_approved' : 'fd2_approved';
        
        Grade::where('project_id', $project->id)->update([
            $column => $approved,
        ]);
    }

    /**
     * Update grades table published status
     */
    protected function updateGradesPublishedStatus(Project $project, string $stage, bool $published): void
    {
        $column = $stage === 'fd1' ? 'fd1_published' : 'fd2_published';
        
        Grade::where('project_id', $project->id)->update([
            $column => $published,
        ]);
    }

    /**
     * Ensure a stage is not locked before modifying
     */
    protected function ensureStageNotLocked(Project $project, string $stage): void
    {
        $approval = DefenseApproval::where('project_id', $project->id)
            ->where('defense_stage', $stage)
            ->first();

        if ($approval && $approval->isLocked()) {
            throw new \Exception("This {$stage} stage has been approved and is now locked.");
        }
    }

    /**
     * Get evaluation statistics for a project and stage
     */
    public function getEvaluationStatistics(Project $project, string $stage): array
    {
        $students = $project->students;
        $totalStudents = $students->count();

        $supervisorCount = DefenseEvaluation::where('project_id', $project->id)
            ->where('defense_stage', $stage)
            ->where('evaluator_role', 'supervisor')
            ->distinct('student_id')
            ->count('student_id');

        $committeeMembers = $project->committeeMembers;
        $expectedCommitteeEvals = $totalStudents * $committeeMembers->count();
        
        $actualCommitteeEvals = DefenseEvaluation::where('project_id', $project->id)
            ->where('defense_stage', $stage)
            ->where('evaluator_role', 'committee_member')
            ->count();

        $approval = DefenseApproval::where('project_id', $project->id)
            ->where('defense_stage', $stage)
            ->first();

        return [
            'totalStudents' => $totalStudents,
            'supervisorEvaluated' => $supervisorCount,
            'committeeExpected' => $expectedCommitteeEvals,
            'committeeSubmitted' => $actualCommitteeEvals,
            'committeeProgress' => $expectedCommitteeEvals > 0 
                ? round(($actualCommitteeEvals / $expectedCommitteeEvals) * 100, 2) 
                : 0,
            'isComplete' => $supervisorCount === $totalStudents && $actualCommitteeEvals === $expectedCommitteeEvals,
            'status' => $approval?->status ?? 'pending',
            'isLocked' => $approval?->isLocked() ?? false,
        ];
    }

    /**
     * Notify Project Committee once when all evaluations are submitted for a project/stage.
     * Retry-safe: only sends if evaluations_ready_notified_at is null.
     */
    public function maybeNotifyProjectCommitteeEvaluationsReady(Project $project, string $stage): void
    {
        $approval = DefenseApproval::firstOrNew([
            'project_id' => $project->id,
            'defense_stage' => $stage,
        ]);

        if ($approval->exists && $approval->evaluations_ready_notified_at !== null) {
            return;
        }

        $stats = $this->getEvaluationStatistics($project, $stage);
        if (!$stats['isComplete']) {
            return;
        }

        if (!$approval->exists) {
            $approval->status = 'pending';
            $approval->save();
        }

        $approval->evaluations_ready_notified_at = now();
        $approval->save();

        $stageLabel = strtoupper($stage);
        $message = [
            'en' => "All evaluations for project \"{$project->title}\" ({$stageLabel}) have been submitted and are ready for review.",
            'ar' => "تم استلام جميع التقييمات للمشروع \"{$project->title}\" ({$stageLabel}) وهي جاهزة للمراجعة.",
        ];

        $projectCommitteeUserIds = User::where('role', 'projects_committee')
            ->where('status', 'active')
            ->pluck('id')
            ->toArray();

        if (!empty($projectCommitteeUserIds)) {
            $this->notificationService->createForUsers(
                $projectCommitteeUserIds,
                json_encode($message),
                'evaluations_ready_for_review',
                Project::class,
                $project->id
            );
        }
    }
}
