<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectRegistrationResource extends JsonResource
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
            'status' => $this->status,
            'submittedAt' => $this->submitted_at?->toISOString(),
            'reviewedAt' => $this->reviewed_at?->toISOString(),
            'reviewedBy' => $this->reviewed_by ? (string) $this->reviewed_by : null,
            'reviewComments' => $this->review_comments,
            'project' => $this->when($this->relationLoaded('project') && $this->project !== null, fn () => new ProjectResource($this->project)),
            'student' => $this->when($this->relationLoaded('student') && $this->student !== null, fn () => new UserResource($this->student)),
            'reviewer' => $this->when($this->relationLoaded('reviewer') && $this->reviewer !== null, fn () => new UserResource($this->reviewer)),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
