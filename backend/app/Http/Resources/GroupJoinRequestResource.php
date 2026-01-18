<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GroupJoinRequestResource extends JsonResource
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
            'studentId' => (string) $this->student_id,
            'status' => $this->status,
            'message' => $this->message,
            'requestedAt' => $this->requested_at?->toISOString(),
            'reviewedAt' => $this->reviewed_at?->toISOString(),
            'reviewedBy' => $this->reviewed_by ? (string) $this->reviewed_by : null,
            'reviewComments' => $this->review_comments,
            'group' => new GroupResource($this->whenLoaded('group')),
            'student' => new UserResource($this->whenLoaded('student')),
            'reviewer' => new UserResource($this->whenLoaded('reviewer')),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
