<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProposalSubmissionResource extends JsonResource
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
            'submitterId' => (string) $this->submitter_id,
            'studentGroupId' => $this->student_group_id ? (string) $this->student_group_id : null,
            'status' => $this->status,
            'reviewNotes' => $this->review_notes,
            'reviewedBy' => $this->reviewed_by ? (string) $this->reviewed_by : null,
            'reviewedAt' => $this->reviewed_at?->toISOString(),
            'submittedAt' => $this->submitted_at?->toISOString(),
            'submitter' => new UserResource($this->whenLoaded('submitter')),
            'reviewer' => new UserResource($this->whenLoaded('reviewer')),
            'studentGroup' => new StudentGroupResource($this->whenLoaded('studentGroup')),
            'proposals' => ProposalResource::collection($this->whenLoaded('proposals')),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
