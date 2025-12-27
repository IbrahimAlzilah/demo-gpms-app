<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProposalResource extends JsonResource
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
            'title' => $this->title,
            'description' => $this->description,
            'objectives' => $this->objectives,
            'methodology' => $this->methodology,
            'expectedOutcomes' => $this->expected_outcomes,
            'status' => $this->status,
            'reviewNotes' => $this->review_notes,
            'reviewedAt' => $this->reviewed_at?->toISOString(),
            'reviewedBy' => $this->reviewed_by ? (string) $this->reviewed_by : null,
            'projectId' => $this->project_id ? (string) $this->project_id : null,
            'submitterId' => (string) $this->submitter_id,
            'submitter' => new UserResource($this->whenLoaded('submitter')),
            'reviewer' => new UserResource($this->whenLoaded('reviewer')),
            'project' => new ProjectResource($this->whenLoaded('project')),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}

