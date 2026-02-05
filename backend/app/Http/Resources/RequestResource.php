<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RequestResource extends JsonResource
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
            'type' => $this->type,
            'studentId' => $this->student_id ? (string) $this->student_id : null,
            'projectId' => $this->project_id ? (string) $this->project_id : null,
            'reason' => $this->reason,
            'status' => $this->status,
            'supervisorApproval' => $this->supervisor_approval,
            'committeeApproval' => $this->committee_approval,
            'additionalData' => $this->additional_data,
            'student' => $this->when($this->relationLoaded('student') && $this->student !== null, fn () => new UserResource($this->student)),
            'project' => $this->when($this->relationLoaded('project') && $this->project !== null, fn () => new ProjectResource($this->project)),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}

