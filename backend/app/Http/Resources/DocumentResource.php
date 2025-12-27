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
            'id' => (string) $this->id,
            'type' => $this->type,
            'projectId' => (string) $this->project_id,
            'fileName' => $this->file_name,
            'fileUrl' => $this->file_url ?? '',
            'fileSize' => $this->file_size,
            'mimeType' => $this->mime_type,
            'submittedBy' => (string) $this->submitted_by,
            'reviewStatus' => $this->review_status,
            'reviewComments' => $this->review_comments,
            'reviewedBy' => $this->reviewed_by ? (string) $this->reviewed_by : null,
            'reviewedAt' => $this->reviewed_at?->toISOString(),
            'project' => new ProjectResource($this->whenLoaded('project')),
            'submittedByUser' => new UserResource($this->whenLoaded('submitter')),
            'reviewer' => new UserResource($this->whenLoaded('reviewer')),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}

