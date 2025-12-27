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
            'id' => $this->id,
            'type' => $this->type,
            'student_id' => $this->student_id,
            'project_id' => $this->project_id,
            'reason' => $this->reason,
            'status' => $this->status,
            'supervisor_approval' => $this->supervisor_approval,
            'committee_approval' => $this->committee_approval,
            'additional_data' => $this->additional_data,
            'student' => new UserResource($this->whenLoaded('student')),
            'project' => new ProjectResource($this->whenLoaded('project')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}

