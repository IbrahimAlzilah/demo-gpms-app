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
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'objectives' => $this->objectives,
            'methodology' => $this->methodology,
            'expected_outcomes' => $this->expected_outcomes,
            'status' => $this->status,
            'review_notes' => $this->review_notes,
            'reviewed_at' => $this->reviewed_at?->toISOString(),
            'project_id' => $this->project_id,
            'submitter' => new UserResource($this->whenLoaded('submitter')),
            'reviewer' => new UserResource($this->whenLoaded('reviewer')),
            'project' => new ProjectResource($this->whenLoaded('project')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}

