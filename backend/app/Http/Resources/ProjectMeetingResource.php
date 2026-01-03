<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectMeetingResource extends JsonResource
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
            'scheduledBy' => (string) $this->scheduled_by,
            'scheduledDate' => $this->scheduled_date?->toISOString(),
            'duration' => $this->duration,
            'location' => $this->location,
            'agenda' => $this->agenda,
            'notes' => $this->notes,
            'project' => new ProjectResource($this->whenLoaded('project')),
            'scheduledByUser' => new UserResource($this->whenLoaded('scheduledBy')),
            'attendees' => UserResource::collection($this->whenLoaded('attendees') ?? []),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
