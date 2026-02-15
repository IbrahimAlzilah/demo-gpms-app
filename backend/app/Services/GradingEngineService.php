<?php

namespace App\Services;

use App\Models\DefenseEvaluation;
use App\Models\DefenseApproval;
use App\Models\Grade;
use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

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
     * - committeeTotal
     * - supervisorContribution
     * - committeeAdjustment
     * - finalGrade
     */
    public function getAggregatedGrades(Project $project, string $stage): array
    {
        if (!in_array($stage, ['fd1', 'fd2'])) {
            throw new \InvalidArgumentException('Invalid defense stage. Must be fd1 or fd2.');
        }

        // Eager load students and all evaluations for this project/stage in one query
        $project->loadMissing(['students', 'committeeMembers']);
        $evaluations = DefenseEvaluation::where('project_id', $project->id)
            ->where('defense_stage', $stage)
            ->with('evaluator:id,name')
            ->get();

        $grades = Grade::where('project_id', $project->id)
            ->whereIn('student_id', $project->students->pluck('id'))
            ->get()
            ->keyBy('student_id');

        $result = [];
        foreach ($project->students as $student) {
            $studentEvals = $evaluations->where('student_id', $student->id);
            $supervisorEval = $studentEvals->where('evaluator_role', 'supervisor')->first();
            $committeeEvals = $studentEvals->where('evaluator_role', 'committee_member');

            $supervisorRaw = null;
            $committeeMembersRaw = [];
            $supervisorContribution = 0;
            $committeeTotal = 0;

            if ($supervisorEval) {
                $norm = $supervisorEval->max_score > 0
                    ? ($supervisorEval->score / $supervisorEval->max_score) * 100
                    : 0;
                $supervisorContribution = ($norm / 100) / 2;
                $supervisorRaw = [
                    'evaluatorId' => $supervisorEval->evaluator_id,
                    'evaluatorName' => $supervisorEval->evaluator->name ?? '',
                    'rawScore' => (float) $supervisorEval->score,
                    'maxScore' => (float) $supervisorEval->max_score,
                ];
            }
            foreach ($committeeEvals as $eval) {
                $norm = $eval->max_score > 0 ? ($eval->score / $eval->max_score) * 100 : 0;
                $contrib = $norm / 5; // Committee contribution per member = grade/5
                $committeeTotal += $contrib;
                $committeeMembersRaw[] = [
                    'evaluatorId' => $eval->evaluator_id,
                    'evaluatorName' => $eval->evaluator->name ?? '',
                    'rawScore' => (float) $eval->score,
                    'maxScore' => (float) $eval->max_score,
                ];
            }
            $supervisorContributionScaled = round($supervisorContribution * 100, 2); // grade/2
            $committeeTotalScaled = round($committeeTotal, 2); // sum(grade/5)

            $grade = $grades->get($student->id);
            $adjustment = $grade ? (float) ($stage === 'fd1' ? ($grade->fd1_adjustment ?? 0) : ($grade->fd2_adjustment ?? 0)) : 0;
            $rawSum = ($supervisorContribution * 100) + $committeeTotal; // supervisor contrib (0-50) + committee total (sum of grade/5)
            $scaledSum = $rawSum;
            $finalGrade = $scaledSum > 0 || $adjustment !== 0.0 ? round($scaledSum + $adjustment, 2) : null;

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
                'committeeTotal' => $committeeTotalScaled,
                'supervisorContribution' => $supervisorContributionScaled,
                'committeeAdjustment' => $adjustment,
                'finalGrade' => $finalGrade,
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
                if ($studentId === null || $score === null || !in_array($studentId, $studentIds)) {
                    continue;
                }
                $student = $project->students->firstWhere('id', $studentId);
                if (!$student) {
                    continue;
                }
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
                if ($studentId === null || $score === null || !in_array($studentId, $studentIds)) {
                    continue;
                }
                $student = $project->students->firstWhere('id', $studentId);
                if (!$student) {
                    continue;
                }
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
