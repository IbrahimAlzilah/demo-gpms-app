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
            'id' => (string) $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'maxStudents' => $this->max_students,
            'currentStudents' => $this->current_students,
            'specialization' => $this->specialization,
            'keywords' => $this->keywords,
            'supervisorId' => $this->supervisor_id ? (string) $this->supervisor_id : null,
            'committeeId' => $this->committee_id,
            'supervisor' => $this->when($this->relationLoaded('supervisor') && $this->supervisor !== null, function () {
                return new UserResource($this->supervisor);
            }),
            'students' => UserResource::collection($this->whenLoaded('students') ?? []),
            'groupId' => $this->when($this->relationLoaded('group') && $this->group !== null, function () {
                return (string) $this->group->id;
            }),
            'group' => $this->when($this->relationLoaded('group') && $this->group !== null, function () {
                return new GroupResource($this->group);
            }),
            'documents' => $this->whenLoaded('documents') ? array_map(function($doc) {
                return $doc['file_path'] ?? $doc['fileUrl'] ?? '';
            }, $this->documents->toArray()) : [],
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}

