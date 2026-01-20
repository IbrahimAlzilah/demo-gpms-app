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
            'leaderId' => (string) $this->leader_id,
            'leader' => new UserResource($this->whenLoaded('leader')),
            'members' => UserResource::collection(
                $this->whenLoaded('members', function () {
                    // Include leader in the members list for display purposes
                    // Use unique to avoid duplicates if data is inconsistent
                    return $this->members->merge([$this->leader])->unique('id');
                })
            ),
            'status' => $this->status,
            'memberCount' => $this->getTotalMemberCount(),
            'maxMembers' => app(\App\Services\SettingsService::class)->getGroupMaxMembers(),
            'minMembers' => app(\App\Services\SettingsService::class)->getGroupMinMembers(),
            'createdAt' => $this->created_at,
            'updatedAt' => $this->updated_at,
        ];
    }
}
