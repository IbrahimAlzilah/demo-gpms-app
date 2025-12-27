<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GroupInvitationResource extends JsonResource
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
            'groupId' => (string) $this->group_id,
            'group' => new GroupResource($this->whenLoaded('group')),
            'inviterId' => (string) $this->inviter_id,
            'inviter' => new UserResource($this->whenLoaded('inviter')),
            'inviteeId' => (string) $this->invitee_id,
            'invitee' => new UserResource($this->whenLoaded('invitee')),
            'status' => $this->status,
            'message' => $this->message,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}

