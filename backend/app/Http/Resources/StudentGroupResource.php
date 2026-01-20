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
            'leader' => new UserResource($this->whenLoaded('leader')),
            'members' => UserResource::collection($this->whenLoaded('members')),
            'status' => $this->status,
            'memberCount' => $this->getTotalMemberCount(),
            'maxMembers' => app(\App\Services\SettingsService::class)->getGroupMaxMembers(),
            'minMembers' => app(\App\Services\SettingsService::class)->getGroupMinMembers(),
            'createdAt' => $this->created_at,
            'updatedAt' => $this->updated_at,
        ];
    }
}
