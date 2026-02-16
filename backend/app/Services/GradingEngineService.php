<?php

namespace App\Services;

use App\Models\DefenseEvaluation;
use App\Models\DefenseApproval;
use App\Models\Grade;
use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Secure grading engine for Committee, Supervisor, and Project Committee.
 * Enforces: raw grades per (project_id, student_id, evaluator_id, defense_stage),
 * FD1/FD2 isolation, strict RBAC, no cross-member visibility.
 *
 * Formulas:
 * - Committee contribution per member = grade / 5
 * - Supervisor contribution = grade / 2
 * - Committee Total = SUM(member contributions)
 * - Final Grade = Committee Total + Supervisor Contribution + Committee Adjustment
 */
class GradingEngineService
{
    public function __construct(
        protected DefenseEvaluationService $defenseEvaluationService
    ) {}

    /**
     * Get aggregated grades for a project/stage (Project Committee only).
     * Optimized: single query for evaluations, no N+1.
     *
     * Returns per student:
     * - rawGrades: { supervisor: { raw, evaluatorId, evaluatorName }, committeeMembers: [...] }
     * - committeeTotal (Scaled)
     * - supervisorContribution (Scaled)
     * - committeeAdjustment
     * - finalGrade
     */
    public function getAggregatedGrades(Project $project, string $stage): array
    {
        if (!in_array($stage, ['fd1', 'fd2'])) {
            throw new \InvalidArgumentException('Invalid defense stage. Must be fd1 or fd2.');
        }

        // Eager load students and all evaluations for this project/stage in one query
        $project->loadMissing(['students', 'committeeMembers', 'supervisor']);
        
        $evaluations = DefenseEvaluation::where('project_id', $project->id)
            ->where('defense_stage', $stage)
            ->with('evaluator:id,name')
            ->get();

        $grades = Grade::where('project_id', $project->id)
            ->whereIn('student_id', $project->students->pluck('id'))
            ->get()
            ->keyBy('student_id');

        $result = [];
        $committeeMemberCount = $project->committeeMembers->count();

        foreach ($project->students as $student) {
            $studentEvals = $evaluations->where('student_id', $student->id);
            $supervisorEval = $studentEvals->where('evaluator_role', 'supervisor')->first();
            $committeeEvals = $studentEvals->where('evaluator_role', 'committee_member');
            
            // Supervisor Calculation: Grade / 2 (50% weight)
            $supervisorRaw = null;
            $supervisorContribution = 0;
            if ($supervisorEval) {
                $rawScore = (float) $supervisorEval->score;
                $maxScore = (float) $supervisorEval->max_score > 0 ? (float) $supervisorEval->max_score : 100;
                $normalized = ($rawScore / $maxScore) * 100;
                $supervisorContribution = $normalized / 2; // 50%

                $supervisorRaw = [
                    'evaluatorId' => $supervisorEval->evaluator_id,
                    'evaluatorName' => $project->supervisor->name ?? 'Supervisor',
                    'rawScore' => $rawScore,
                    'maxScore' => $maxScore,
                    'contribution' => $supervisorContribution
                ];
            }

            // Committee Calculation: SUM(Grade / 5) (20% weight per member)
            $committeeMembersRaw = [];
            $committeeTotalContribution = 0;

            foreach ($committeeEvals as $eval) {
                $rawScore = (float) $eval->score;
                $maxScore = (float) $eval->max_score > 0 ? (float) $eval->max_score : 100;
                $normalized = ($rawScore / $maxScore) * 100;
                
                // Formula: Each member contributes 20% (Grade / 5)
                // This assumes standard 2-member committee. 
                // If committee size varies, this formula might strictly imply 20% per *any* member.
                // Based on user requirement: "Each member contribution = grade / 5"
                $contribution = $normalized / 5; 
                
                $committeeTotalContribution += $contribution;

                $committeeMembersRaw[] = [
                    'evaluatorId' => $eval->evaluator_id,
                    'evaluatorName' => $eval->evaluator->name ?? 'Committee Member',
                    'rawScore' => $rawScore,
                    'maxScore' => $maxScore,
                    'contribution' => $contribution
                ];
            }

            // Get Adjustment and Final Grade from stored Grade record or calculate on fly
            $gradeRecord = $grades->get($student->id);
            $adjustment = 0.0;
            if ($gradeRecord) {
                $adjustment = (float) ($stage === 'fd1' ? ($gradeRecord->fd1_adjustment ?? 0) : ($gradeRecord->fd2_adjustment ?? 0));
            }

            // Final Grade Calculation
            // Base = Supervisor (50%) + Committee Total (Sum of 20% chunks)
            $baseScore = $supervisorContribution + $committeeTotalContribution;
            
            // Final = Base + Adjustment
            $finalGrade = $baseScore + $adjustment;

            // Ensure not negative (optional, but good practice)
            $finalGrade = max(0, $finalGrade);

            // Cap at 100? Requirement doesn't explicitly say, but grades usually are 0-100.
            // Leaving uncapped for now to allow bonus points via adjustment if needed, 
            // but standard logic implies 100 max.
            // visual display typically truncates.

            $result[] = [
                'student' => [
                    'id' => $student->id,
                    'name' => $student->name ?? '',
                    'email' => $student->email,
                    'studentId' => $student->student_id ?? $student->username,
                ],
                'rawGrades' => [
                    'supervisor' => $supervisorRaw,
                    'committeeMembers' => $committeeMembersRaw,
                ],
                'committeeTotal' => round($committeeTotalContribution, 2),
                'supervisorContribution' => round($supervisorContribution, 2),
                'committeeAdjustment' => $adjustment,
                'finalGrade' => round($finalGrade, 2),
                'isComplete' => $supervisorEval && ($committeeEvals->count() >= $committeeMemberCount),
            ];
        }

        return $result;
    }

    /**
     * Submit multiple committee member evaluations in a single transaction.
     * Each evaluator can only submit their own; no overwriting others.
     */
    public function submitBulkCommitteeEvaluations(
        Project $project,
        User $committeeMember,
        string $stage,
        array $items
    ): Collection {
        if (!in_array($stage, ['fd1', 'fd2'])) {
            throw new \InvalidArgumentException('Invalid defense stage. Must be fd1 or fd2.');
        }

        // Verify assignment
        $isAssigned = $project->committeeMembers()->where('users.id', $committeeMember->id)->exists();
        if (!$isAssigned) {
            throw new \Exception('You are not assigned to this project\'s defense committee.');
        }

        $project->loadMissing('students');
        $studentIds = $project->students->pluck('id')->toArray();

        return DB::transaction(function () use ($project, $committeeMember, $stage, $items, $studentIds) {
            $created = collect();
            foreach ($items as $item) {
                $studentId = $item['student_id'] ?? null;
                $score = $item['score'] ?? null;
                
                // Security check: ensure student belongs to project
                if ($studentId === null || $score === null || !in_array($studentId, $studentIds)) {
                    continue; // Skip invalid or unrelated students
                }

                $student = $project->students->firstWhere('id', $studentId);
                
                // Delegate to single evaluation service which handles 
                // - Unique constraint (update or create)
                // - Validation
                // - Audit trail (created_by/modified_by)
                $evaluation = $this->defenseEvaluationService->submitCommitteeMemberEvaluation(
                    $project,
                    $student,
                    $committeeMember,
                    $stage,
                    [
                        'score' => (float) $score,
                        'maxScore' => $item['maxScore'] ?? 100,
                        'criteria' => $item['criteria'] ?? [],
                        'notes' => $item['notes'] ?? null,
                    ]
                );
                $created->push($evaluation);
            }
            return $created;
        });
    }

    /**
     * Submit multiple supervisor evaluations in a single transaction.
     */
    public function submitBulkSupervisorEvaluations(
        Project $project,
        User $supervisor,
        string $stage,
        array $items
    ): Collection {
        if (!in_array($stage, ['fd1', 'fd2'])) {
            throw new \InvalidArgumentException('Invalid defense stage. Must be fd1 or fd2.');
        }

        // Verify supervisor ownership
        if ($project->supervisor_id !== $supervisor->id) {
            throw new \Exception('Unauthorized to grade this project.');
        }

        $project->loadMissing('students');
        $studentIds = $project->students->pluck('id')->toArray();

        return DB::transaction(function () use ($project, $supervisor, $stage, $items, $studentIds) {
            $created = collect();
            foreach ($items as $item) {
                $studentId = $item['student_id'] ?? null;
                $score = $item['score'] ?? null;

                // Security check
                if ($studentId === null || $score === null || !in_array($studentId, $studentIds)) {
                    continue;
                }
                
                $student = $project->students->firstWhere('id', $studentId);

                $evaluation = $this->defenseEvaluationService->submitSupervisorEvaluation(
                    $project,
                    $student,
                    $stage,
                    [
                        'score' => (float) $score,
                        'maxScore' => $item['maxScore'] ?? 100,
                        'criteria' => $item['criteria'] ?? [],
                        'notes' => $item['notes'] ?? null,
                    ],
                    $supervisor
                );
                $created->push($evaluation);
            }
            return $created;
        });
    }
}
