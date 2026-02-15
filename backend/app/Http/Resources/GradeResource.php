<?php

namespace App\Http\Resources;

use App\Models\DefenseApproval;
use App\Services\DefenseEvaluationService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GradeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $project = $this->relationLoaded('project') ? $this->project : $this->project;
        $student = $this->relationLoaded('student') ? $this->student : $this->student;

        $emptyBreakdown = [
            'supervisor' => null,
            'supervisorContribution' => 0,
            'committeeMembers' => [],
            'committeeContribution' => 0,
            'projectCommitteeMembers' => [],
            'projectCommitteeContribution' => 0,
            'finalGrade' => null,
        ];
        $fd1Breakdown = $emptyBreakdown;
        $fd2Breakdown = $emptyBreakdown;
        $fd1ApprovalStatus = 'pending';
        $fd2ApprovalStatus = 'pending';

        $project = $project ?? $this->project;
        $student = $student ?? $this->student;

        if ($project && $student) {
            try {
                $evalService = app(DefenseEvaluationService::class);
                $fd1Breakdown = $this->appendDefenseStageToBreakdown(
                    array_merge($emptyBreakdown, $evalService->getGradeBreakdown($project, $student, 'fd1')),
                    'fd1'
                );
                $fd2Breakdown = $this->appendDefenseStageToBreakdown(
                    array_merge($emptyBreakdown, $evalService->getGradeBreakdown($project, $student, 'fd2')),
                    'fd2'
                );
            } catch (\Throwable $e) {
                // Ensure consistent structure on error
            }

            $fd1Approval = DefenseApproval::where('project_id', $project->id)->where('defense_stage', 'fd1')->first();
            $fd2Approval = DefenseApproval::where('project_id', $project->id)->where('defense_stage', 'fd2')->first();
            $fd1ApprovalStatus = $fd1Approval?->status ?? 'pending';
            $fd2ApprovalStatus = $fd2Approval?->status ?? 'pending';
        }

        return [
            'id' => (string) $this->id,
            'projectId' => (string) $this->project_id,
            'studentId' => (string) $this->student_id,
            'supervisorGrade' => $this->supervisor_grade,
            'committeeGrade' => $this->committee_grade,
            'finalGrade' => $this->final_grade ? (float) $this->final_grade : null,
            'isApproved' => $this->is_approved,
            'approvedAt' => $this->approved_at?->toISOString(),
            'approvedBy' => $this->approved_by ? (string) $this->approved_by : null,
            'project' => new ProjectResource($this->whenLoaded('project')),
            'student' => new UserResource($this->whenLoaded('student')),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'supervisorScore' => ($this->display_supervisor_grade ?? [])['score'] ?? $this->getSupervisorScore(),
            'committeeScore' => ($this->display_committee_grade ?? [])['score'] ?? $this->getCommitteeScore(),
            'isReadyForApproval' => $this->isReadyForApproval(),
            'validationErrors' => $this->is_approved ? [] : $this->getApprovalValidationErrors(),
            'fd1FinalGrade' => $this->fd1_final_grade ? (float) $this->fd1_final_grade : null,
            'fd2FinalGrade' => $this->fd2_final_grade ? (float) $this->fd2_final_grade : null,
            'fd1Adjustment' => $this->fd1_adjustment !== null ? (float) $this->fd1_adjustment : null,
            'fd2Adjustment' => $this->fd2_adjustment !== null ? (float) $this->fd2_adjustment : null,
            'isFd1Approved' => (bool) $this->fd1_approved,
            'isFd2Approved' => (bool) $this->fd2_approved,
            'fd1Published' => (bool) $this->fd1_published,
            'fd2Published' => (bool) $this->fd2_published,
            'fd1SupervisorScore' => $this->getFD1SupervisorScore(),
            'fd1CommitteeScore' => $this->getFD1CommitteeScore(),
            'fd2SupervisorScore' => $this->getFD2SupervisorScore(),
            'fd2CommitteeScore' => $this->getFD2CommitteeScore(),
            'fd1GradeBreakdown' => $fd1Breakdown,
            'fd2GradeBreakdown' => $fd2Breakdown,
            'fd1ApprovalStatus' => $fd1ApprovalStatus,
            'fd2ApprovalStatus' => $fd2ApprovalStatus,
            'committeeEvaluations' => $this->buildCommitteeEvaluationsForStage($fd1Breakdown, $fd2Breakdown),
            'supervisorEvaluation' => $fd1Breakdown['supervisor'] ?? $fd2Breakdown['supervisor'] ?? null,
        ];
    }

    private function appendDefenseStageToBreakdown(array $breakdown, string $stage): array
    {
        $breakdown['defenseStage'] = $stage;
        $breakdown['committeeMembers'] = $breakdown['committeeMembers'] ?? [];
        foreach ($breakdown['committeeMembers'] as &$m) {
            $m['defenseStage'] = $stage;
        }
        $breakdown['projectCommitteeMembers'] = $breakdown['projectCommitteeMembers'] ?? [];
        foreach ($breakdown['projectCommitteeMembers'] as &$m) {
            $m['defenseStage'] = $stage;
        }
        if (!empty($breakdown['supervisor'])) {
            $breakdown['supervisor']['defenseStage'] = $stage;
        }
        return $breakdown;
    }

    private function buildCommitteeEvaluationsForStage(?array $fd1, ?array $fd2): array
    {
        $out = [];
        $fd1 = $fd1 ?? ['committeeMembers' => []];
        $fd2 = $fd2 ?? ['committeeMembers' => []];
        foreach (($fd1['committeeMembers'] ?? []) as $m) {
            $out[] = $this->normalizeCommitteeEval($m, 'fd1');
        }
        foreach (($fd2['committeeMembers'] ?? []) as $m) {
            $out[] = $this->normalizeCommitteeEval($m, 'fd2');
        }

        // Fallback: synthesize from legacy committee_grade when FD breakdown has no committee members
        if (empty($out)) {
            $legacy = $this->synthesizeFromLegacyCommitteeGrade();
            $out = array_merge($out, $legacy);
        }

        return $out;
    }

    /**
     * When fd1/fd2 breakdown has no committee members but legacy committee_grade exists
     * with committeeMembers IDs and aggregate score, synthesize committeeEvaluations.
     */
    private function synthesizeFromLegacyCommitteeGrade(): array
    {
        $cg = $this->committee_grade;
        if (!is_array($cg)) {
            return [];
        }
        $memberIds = $cg['committeeMembers'] ?? [];
        $aggregateScore = isset($cg['score']) ? (float) $cg['score'] : null;
        if (empty($memberIds) || $aggregateScore === null) {
            return [];
        }

        $project = $this->relationLoaded('project') ? $this->project : null;
        $project = $project ?? $this->project;
        if (!$project || !$project->relationLoaded('committeeMembers')) {
            return [];
        }

        $membersById = [];
        foreach ($project->committeeMembers ?? [] as $u) {
            $membersById[(string) $u->id] = $u;
        }

        $out = [];
        foreach ($memberIds as $id) {
            $idStr = (string) $id;
            $user = $membersById[$idStr] ?? null;
            $name = $user ? ($user->name ?? '') : '';
            // Use aggregate score per member for display (Committee Total uses committeeScore fallback)
            $out[] = $this->normalizeCommitteeEval([
                'evaluatorId' => (int) $id,
                'evaluatorName' => $name,
                'rawScore' => $aggregateScore,
                'score' => $aggregateScore,
                'normalizedScore' => $aggregateScore,
                'contribution' => 0,
                'isLegacySynthesized' => true,
            ], 'fd1');
        }
        return $out;
    }

    private function normalizeCommitteeEval(array $m, string $stage): array
    {
        $raw = $m['rawScore'] ?? $m['score'] ?? $m['normalizedScore'] ?? 0;
        $contribution = $m['contribution'] ?? 0;
        return array_merge($m, [
            'defenseStage' => $stage,
            'rawScore' => (float) $raw,
            'score' => (float) $raw,
            'contribution' => (float) $contribution,
            'evaluatorName' => $m['evaluatorName'] ?? '',
        ]);
    }
}

