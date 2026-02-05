<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentGroupResource extends JsonResource
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
            'name' => $this->name,
            'groupCode' => $this->group_code,
            'leaderId' => $this->leader_id ? (string) $this->leader_id : null,
            'leader' => $this->when($this->relationLoaded('leader') && $this->leader !== null, fn () => new UserResource($this->leader)),
            'members' => $this->when($this->relationLoaded('members'), function () {
                // Ensure we never pass null to collection() (avoids "map on null")
                $members = $this->members ?? collect();
                $leader = $this->leader ?? null;
                $combined = $leader ? $members->merge([$leader])->unique('id') : $members;
                return UserResource::collection($combined);
            }),
            'status' => $this->status,
            'memberCount' => $this->getTotalMemberCount(),
            'maxMembers' => app(\App\Services\SettingsService::class)->getGroupMaxMembers(),
            'minMembers' => app(\App\Services\SettingsService::class)->getGroupMinMembers(),
            'createdAt' => $this->created_at,
            'updatedAt' => $this->updated_at,
            'projectId' => $this->when($this->relationLoaded('assignedProjects'), fn () => $this->assignedProjects->first()?->id),
            'proposalsInitialSubmittedAt' => $this->proposals_initial_submitted_at,
        ];
    }
}
