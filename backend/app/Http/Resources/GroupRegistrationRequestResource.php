<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GroupRegistrationRequestResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Handle both Eloquent models and stdClass objects (for legacy registrations)
        $isModel = is_object($this->resource) && method_exists($this->resource, 'getAttribute');

        $id = $isModel ? (string) $this->id : (string) ($this->resource->id ?? '');
        $studentGroupId = $isModel ? (string) $this->student_group_id : (string) ($this->resource->student_group_id ?? '');
        $submittedBy = $isModel ? (string) $this->submitted_by : (string) ($this->resource->submitted_by ?? '');
        $status = $isModel ? $this->status : ($this->resource->status ?? 'pending');
        $submittedAt = $isModel ? $this->submitted_at?->toISOString() : ($this->resource->submitted_at instanceof \Carbon\Carbon ? $this->resource->submitted_at->toISOString() : $this->resource->submitted_at ?? null);
        $reviewedAt = $isModel ? $this->reviewed_at?->toISOString() : ($this->resource->reviewed_at instanceof \Carbon\Carbon ? $this->resource->reviewed_at->toISOString() : $this->resource->reviewed_at ?? null);
        $reviewedBy = $isModel ? ($this->reviewed_by ? (string) $this->reviewed_by : null) : ($this->resource->reviewed_by ? (string) $this->resource->reviewed_by : null);
        $reviewComments = $isModel ? $this->review_comments : ($this->resource->review_comments ?? null);
        $approvedProjectId = $isModel ? ($this->approved_project_id ? (string) $this->approved_project_id : null) : ($this->resource->approved_project_id ? (string) $this->resource->approved_project_id : null);
        $createdAt = $isModel ? $this->created_at?->toISOString() : ($this->resource->created_at instanceof \Carbon\Carbon ? $this->resource->created_at->toISOString() : $this->resource->created_at ?? null);
        $updatedAt = $isModel ? $this->updated_at?->toISOString() : ($this->resource->updated_at instanceof \Carbon\Carbon ? $this->resource->updated_at->toISOString() : $this->resource->updated_at ?? null);

        // Get relationships
        $studentGroup = $isModel ? $this->whenLoaded('studentGroup') : ($this->resource->studentGroup ?? null);
        $submitter = $isModel ? $this->whenLoaded('submitter') : ($this->resource->submitter ?? null);
        $reviewer = $isModel ? $this->whenLoaded('reviewer') : ($this->resource->reviewer ?? null);
        $approvedProject = $isModel ? $this->whenLoaded('approvedProject') : ($this->resource->approvedProject ?? null);
        $projectRegistrations = $isModel ? $this->whenLoaded('projectRegistrations') : ($this->resource->projectRegistrations ?? collect([]));

        return [
            'id' => $id,
            'studentGroupId' => $studentGroupId,
            'submittedBy' => $submittedBy,
            'status' => $status,
            'submittedAt' => $submittedAt,
            'reviewedAt' => $reviewedAt,
            'reviewedBy' => $reviewedBy,
            'reviewComments' => $reviewComments,
            'approvedProjectId' => $approvedProjectId,
            'studentGroup' => $studentGroup ? new StudentGroupResource($studentGroup) : null,
            'submitter' => $submitter ? new UserResource($submitter) : null,
            'reviewer' => $reviewer ? new UserResource($reviewer) : null,
            'approvedProject' => $approvedProject ? new ProjectResource($approvedProject) : null,
            'projectRegistrations' => $projectRegistrations ? ProjectRegistrationResource::collection($projectRegistrations) : [],
            'createdAt' => $createdAt,
            'updatedAt' => $updatedAt,
        ];
    }
}
