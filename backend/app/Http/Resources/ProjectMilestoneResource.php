<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectMilestoneResource extends JsonResource
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
            'title' => $this->title,
            'description' => $this->description,
            'dueDate' => $this->due_date?->toISOString(),
            'type' => $this->type,
            'completed' => $this->completed,
            'completedAt' => $this->completed_at?->toISOString(),
            'project' => new ProjectResource($this->whenLoaded('project')),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
