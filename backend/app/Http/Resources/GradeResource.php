<?php

namespace App\Http\Resources;

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
            // Additional computed fields
            'supervisorScore' => ($this->display_supervisor_grade ?? [])['score'] ?? $this->getSupervisorScore(),
            'committeeScore' => ($this->display_committee_grade ?? [])['score'] ?? $this->getCommitteeScore(),
            'isReadyForApproval' => $this->isReadyForApproval(),
            'validationErrors' => $this->is_approved ? [] : $this->getApprovalValidationErrors(),
            'fd1FinalGrade' => $this->fd1_final_grade ? (float) $this->fd1_final_grade : null,
            'fd2FinalGrade' => $this->fd2_final_grade ? (float) $this->fd2_final_grade : null,
            'isFd1Approved' => (bool) $this->fd1_approved,
            'isFd2Approved' => (bool) $this->fd2_approved,
            'fd1SupervisorScore' => $this->getFD1SupervisorScore(),
            'fd1CommitteeScore' => $this->getFD1CommitteeScore(),
            'fd2SupervisorScore' => $this->getFD2SupervisorScore(),
            'fd2CommitteeScore' => $this->getFD2CommitteeScore(),
        ];
    }
}

