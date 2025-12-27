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
            'id' => $this->id,
            'project_id' => $this->project_id,
            'student_id' => $this->student_id,
            'supervisor_grade' => $this->supervisor_grade,
            'committee_grade' => $this->committee_grade,
            'final_grade' => $this->final_grade,
            'is_approved' => $this->is_approved,
            'approved_at' => $this->approved_at?->toISOString(),
            'project' => new ProjectResource($this->whenLoaded('project')),
            'student' => new UserResource($this->whenLoaded('student')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}

