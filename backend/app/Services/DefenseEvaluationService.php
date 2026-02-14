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

        // Validate student belongs to the project
        if (!$project->students->contains('id', $student->id)) {
            throw new \Exception('Student is not part of this project.');
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
     * Project Committee cannot edit when stage is published (locked).
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

        // Block all edits when stage is published (permanent lock)
        $approval = DefenseApproval::where('project_id', $evaluation->project_id)
            ->where('defense_stage', $evaluation->defense_stage)
            ->first();

        if ($approval && $approval->status === 'published') {
            throw new \Exception('Cannot modify evaluations after the stage has been published. Records are permanently locked.');
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

        // Block when stage is published (Project Committee can add adjustments until publish)
        $approval = DefenseApproval::where('project_id', $project->id)
            ->where('defense_stage', $stage)
            ->first();
        if ($approval && $approval->status === 'published') {
            throw new \Exception('Cannot add evaluations after the stage has been published. Records are permanently locked.');
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

            if ($approval->status === 'published') {
                throw new \Exception('Stage is already published.');
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
     *
     * Formula (as per requirements):
     * - Committee contribution: sum of ((member_grade/100)/5) for each committee member
     * - Supervisor contribution: (supervisor_grade/100)/2
     * - Final grade: committee_total + supervisor_contribution
     * - Scale to 0-100 for display: multiply by 100 (typical max ~1.1 with 3 committee + supervisor)
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

        // normalized_score is 0-100 (percentage)
        // Supervisor: (grade/100)/2
        $supervisorContribution = $supervisorEval ? (($supervisorEval->normalized_score / 100) / 2) : 0;

        // Committee: (grade/100)/5 per member
        $committeeContribution = 0;
        foreach ($committeeEvals as $eval) {
            $committeeContribution += (($eval->normalized_score / 100) / 5);
        }

        // Project committee: (grade/100)/5 per member (same as regular committee)
        $projectCommitteeContribution = 0;
        foreach ($projectCommitteeEvals as $eval) {
            $projectCommitteeContribution += (($eval->normalized_score / 100) / 5);
        }

        // Final grade: sum of contributions, scaled to 0-100 for consistency
        $rawSum = $supervisorContribution + $committeeContribution + $projectCommitteeContribution;
        $finalGrade = $rawSum > 0 ? round($rawSum * 100, 2) : null;

        return $finalGrade;
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

    /**
     * Get detailed grade breakdown for a student (for Project Committee review)
     * Returns raw grades, individual contributions, and final grade
     */
    public function getGradeBreakdown(Project $project, User $student, string $stage): array
    {
        $evaluations = DefenseEvaluation::where('project_id', $project->id)
            ->where('student_id', $student->id)
            ->where('defense_stage', $stage)
            ->with('evaluator')
            ->get();

        // Separate by role
        $supervisorEval = $evaluations->where('evaluator_role', 'supervisor')->first();
        $committeeEvals = $evaluations->where('evaluator_role', 'committee_member');
        $projectCommitteeEvals = $evaluations->where('evaluator_role', 'project_committee');

        // Formula: (grade/100)/5 for committee, (grade/100)/2 for supervisor
        // Contributions are 0-1 scale; final is scaled to 0-100
        $supervisorContribution = 0;
        $supervisorData = null;
        if ($supervisorEval) {
            $supervisorContribution = ($supervisorEval->normalized_score / 100) / 2;
            $supervisorData = [
                'id' => $supervisorEval->id,
                'evaluatorId' => $supervisorEval->evaluator_id,
                'evaluatorName' => $supervisorEval->evaluator->name ?? '',
                'rawScore' => $supervisorEval->score,
                'maxScore' => $supervisorEval->max_score,
                'normalizedScore' => $supervisorEval->normalized_score,
                'contribution' => round($supervisorContribution * 100, 2),
                'formula' => '(grade/100)/2',
                'notes' => $supervisorEval->notes,
                'createdAt' => $supervisorEval->created_at?->toISOString(),
            ];
        }

        // Committee: (grade/100)/5 per member
        $committeeContribution = 0;
        $committeeData = [];
        foreach ($committeeEvals as $eval) {
            $contribution = ($eval->normalized_score / 100) / 5;
            $committeeContribution += $contribution;
            $committeeData[] = [
                'id' => $eval->id,
                'evaluatorId' => $eval->evaluator_id,
                'evaluatorName' => $eval->evaluator->name ?? '',
                'rawScore' => $eval->score,
                'maxScore' => $eval->max_score,
                'normalizedScore' => $eval->normalized_score,
                'contribution' => round($contribution * 100, 2),
                'formula' => '(grade/100)/5',
                'notes' => $eval->notes,
                'createdAt' => $eval->created_at?->toISOString(),
            ];
        }

        // Project committee: (grade/100)/5 per member
        $projectCommitteeContribution = 0;
        $projectCommitteeData = [];
        foreach ($projectCommitteeEvals as $eval) {
            $contribution = ($eval->normalized_score / 100) / 5;
            $projectCommitteeContribution += $contribution;
            $projectCommitteeData[] = [
                'id' => $eval->id,
                'evaluatorId' => $eval->evaluator_id,
                'evaluatorName' => $eval->evaluator->name ?? '',
                'rawScore' => $eval->score,
                'maxScore' => $eval->max_score,
                'normalizedScore' => $eval->normalized_score,
                'contribution' => round($contribution * 100, 2),
                'formula' => '(grade/100)/5',
                'notes' => $eval->notes,
                'createdAt' => $eval->created_at?->toISOString(),
            ];
        }

        // Final grade: raw sum (0-~1.1) * 100 for 0-100 scale
        $rawSum = $supervisorContribution + $committeeContribution + $projectCommitteeContribution;
        $finalGrade = $rawSum > 0 ? round($rawSum * 100, 2) : null;

        return [
            'supervisor' => $supervisorData,
            'supervisorContribution' => round($supervisorContribution * 100, 2),
            'committeeMembers' => $committeeData,
            'committeeContribution' => round($committeeContribution * 100, 2),
            'projectCommitteeMembers' => $projectCommitteeData,
            'projectCommitteeContribution' => round($projectCommitteeContribution * 100, 2),
            'finalGrade' => $finalGrade,
        ];
    }

    /**
     * Validate that all required evaluations exist before approval
     * Returns array of validation errors (empty if valid)
     */
    public function validateEvaluationsForApproval(Project $project, string $stage): array
    {
        $errors = [];
        $students = $project->students;
        $committeeMembers = $project->committeeMembers;

        if ($students->isEmpty()) {
            $errors[] = 'No students assigned to this project';
            return $errors;
        }

        foreach ($students as $student) {
            $studentErrors = [];

            // Check supervisor evaluation
            $supervisorEval = DefenseEvaluation::where('project_id', $project->id)
                ->where('student_id', $student->id)
                ->where('defense_stage', $stage)
                ->where('evaluator_role', 'supervisor')
                ->first();

            if (!$supervisorEval) {
                $studentErrors[] = 'Missing supervisor evaluation';
            }

            // Check committee evaluations
            $committeeEvalCount = DefenseEvaluation::where('project_id', $project->id)
                ->where('student_id', $student->id)
                ->where('defense_stage', $stage)
                ->where('evaluator_role', 'committee_member')
                ->count();

            $expectedCommitteeEvals = $committeeMembers->count();
            if ($committeeEvalCount < $expectedCommitteeEvals) {
                $studentErrors[] = "Missing committee evaluations ({$committeeEvalCount}/{$expectedCommitteeEvals})";
            }

            if (!empty($studentErrors)) {
                $errors[] = "Student {$student->name} ({$student->username}): " . implode(', ', $studentErrors);
            }
        }

        return $errors;
    }
}
