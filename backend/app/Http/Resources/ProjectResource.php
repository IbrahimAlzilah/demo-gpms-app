<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
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
            'status' => $this->status,
            'max_students' => $this->max_students,
            'current_students' => $this->current_students,
            'specialization' => $this->specialization,
            'keywords' => $this->keywords,
            'supervisor_id' => $this->supervisor_id,
            'committee_id' => $this->committee_id,
            'supervisor' => new UserResource($this->whenLoaded('supervisor')),
            'students' => UserResource::collection($this->whenLoaded('students')),
            'group' => new GroupResource($this->whenLoaded('group')),
            'committee_members' => UserResource::collection($this->whenLoaded('committeeMembers')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}

