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
            'currentGroups' => $this->assigned_group_id ? 1 : 0,
            'maxGroups' => 1,
            'assignedGroupId' => $this->assigned_group_id ? (string) $this->assigned_group_id : null,
            'isLinkedToGroup' => $this->assigned_group_id !== null,
            'specialization' => $this->specialization,
            'keywords' => $this->keywords,
            'supervisorId' => $this->supervisor_id ? (string) $this->supervisor_id : null,
            'committeeId' => $this->committee_id,
            'projectCommitteeId' => $this->project_committee_id ? (string) $this->project_committee_id : null,
            'discussionCommitteeId' => $this->discussion_committee_id ? (string) $this->discussion_committee_id : null,
            'supervisorApprovalStatus' => $this->supervisor_approval_status,
            'supervisorApprovalComments' => $this->supervisor_approval_comments,
            'supervisorApprovalAt' => $this->supervisor_approval_at?->toISOString(),
            'supervisor' => $this->when($this->relationLoaded('supervisor') && $this->supervisor !== null, function () {
                return new UserResource($this->supervisor);
            }),
            'students' => UserResource::collection($this->whenLoaded('students') ?? []),
            'assignedGroup' => $this->when($this->relationLoaded('assignedGroup') && $this->assignedGroup !== null, function () {
                return new StudentGroupResource($this->assignedGroup);
            }),
            'groups' => $this->when($this->relationLoaded('assignedGroup') && $this->assignedGroup !== null, function () {
                return [new StudentGroupResource($this->assignedGroup)];
            }, []),
            'groupId' => $this->when($this->relationLoaded('assignedGroup') && $this->assignedGroup !== null, function () {
                return (string) $this->assignedGroup->id;
            }),
            'group' => $this->when($this->relationLoaded('assignedGroup') && $this->assignedGroup !== null, function () {
                return new StudentGroupResource($this->assignedGroup);
            }),
            'groupName' => $this->when($this->relationLoaded('assignedGroup') && $this->assignedGroup !== null, function () {
                return $this->assignedGroup->name ?? $this->assignedGroup->group_code ?? null;
            }),
            'documents' => $this->whenLoaded('documents') ? DocumentResource::collection($this->documents) : [],
            'grades' => $this->whenLoaded('grades') ? GradeResource::collection($this->grades) : [],
            'committeeMembers' => $this->whenLoaded('committeeMembers') ? UserResource::collection($this->committeeMembers) : [],
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}

