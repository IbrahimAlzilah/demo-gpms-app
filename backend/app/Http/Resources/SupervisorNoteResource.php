<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupervisorNoteResource extends JsonResource
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
            'supervisorId' => (string) $this->supervisor_id,
            'content' => $this->content,
            'project' => new ProjectResource($this->whenLoaded('project')),
            'supervisor' => new UserResource($this->whenLoaded('supervisor')),
            'replies' => NoteReplyResource::collection($this->whenLoaded('replies') ?? []),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
