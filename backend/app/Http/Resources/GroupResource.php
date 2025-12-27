<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GroupResource extends JsonResource
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
            'leaderId' => (string) $this->leader_id,
            'maxMembers' => $this->max_members,
            'project' => new ProjectResource($this->whenLoaded('project')),
            'leader' => new UserResource($this->whenLoaded('leader')),
            'members' => UserResource::collection($this->whenLoaded('members')),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}

