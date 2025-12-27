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
        ];
    }
}

