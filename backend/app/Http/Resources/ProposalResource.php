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
            'requirements' => $this->requirements,
            'proposedSupervisorId' => $this->proposed_supervisor_id ? (string) $this->proposed_supervisor_id : null,
            'teamMembers' => $this->team_members ?? [],
            'status' => $this->status,
            'reviewNotes' => $this->review_notes,
            'reviewedAt' => $this->reviewed_at?->toISOString(),
            'reviewedBy' => $this->reviewed_by ? (string) $this->reviewed_by : null,
            'projectId' => $this->project_id ? (string) $this->project_id : null,
            'studentGroupId' => $this->student_group_id ? (string) $this->student_group_id : null,
            'targetProjectId' => $this->target_project_id ? (string) $this->target_project_id : null,
            'submitterId' => (string) $this->submitter_id,
            'submitter' => new UserResource($this->whenLoaded('submitter')),
            'reviewer' => new UserResource($this->whenLoaded('reviewer')),
            'proposedSupervisor' => new UserResource($this->whenLoaded('proposedSupervisor')),
            'studentGroup' => new StudentGroupResource($this->whenLoaded('studentGroup')),
            'targetProject' => new ProjectResource($this->whenLoaded('targetProject')),
            'project' => new ProjectResource($this->whenLoaded('project')),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}

