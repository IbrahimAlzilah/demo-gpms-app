<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupervisorAssignmentRequestResource extends JsonResource
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
            'project' => new ProjectResource($this->whenLoaded('project')),
            'supervisor_id' => $this->supervisor_id,
            'supervisor' => new UserResource($this->whenLoaded('supervisor')),
            'requested_by' => $this->requested_by,
            'requestedBy' => new UserResource($this->whenLoaded('requestedBy')),
            'responded_by' => $this->responded_by,
            'respondedBy' => new UserResource($this->whenLoaded('respondedBy')),
            'status' => $this->status,
            'committee_notes' => $this->committee_notes,
            'supervisor_response' => $this->supervisor_response,
            'responded_at' => $this->responded_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
