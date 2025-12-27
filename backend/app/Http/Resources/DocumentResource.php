<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentResource extends JsonResource
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
            'type' => $this->type,
            'project_id' => $this->project_id,
            'file_name' => $this->file_name,
            'file_url' => $this->file_url,
            'file_size' => $this->file_size,
            'mime_type' => $this->mime_type,
            'review_status' => $this->review_status,
            'review_comments' => $this->review_comments,
            'reviewed_at' => $this->reviewed_at?->toISOString(),
            'project' => new ProjectResource($this->whenLoaded('project')),
            'submitter' => new UserResource($this->whenLoaded('submitter')),
            'reviewer' => new UserResource($this->whenLoaded('reviewer')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}

