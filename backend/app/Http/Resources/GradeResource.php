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

        $fd1Breakdown = null;
        $fd2Breakdown = null;
        $fd1ApprovalStatus = 'pending';
        $fd2ApprovalStatus = 'pending';

        if ($project && $student) {
            $evalService = app(DefenseEvaluationService::class);
            $fd1Breakdown = $this->appendDefenseStageToBreakdown(
                $evalService->getGradeBreakdown($project, $student, 'fd1'),
                'fd1'
            );
            $fd2Breakdown = $this->appendDefenseStageToBreakdown(
                $evalService->getGradeBreakdown($project, $student, 'fd2'),
                'fd2'
            );

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
        foreach (($breakdown['committeeMembers'] ?? []) as &$m) {
            $m['defenseStage'] = $stage;
        }
        foreach (($breakdown['projectCommitteeMembers'] ?? []) as &$m) {
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
        foreach (($fd1['committeeMembers'] ?? []) as $m) {
            $out[] = array_merge($m, ['defenseStage' => 'fd1']);
        }
        foreach (($fd2['committeeMembers'] ?? []) as $m) {
            $out[] = array_merge($m, ['defenseStage' => 'fd2']);
        }
        return $out;
    }
}

