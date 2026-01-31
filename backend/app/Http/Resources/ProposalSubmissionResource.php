<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProposalSubmissionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->resource['id'],
            'origin' => $this->resource['origin'],
            'status' => $this->resource['status'],
            'submittedAt' => $this->resource['submittedAt'],
            'lastUpdatedAt' => $this->resource['lastUpdatedAt'],
            'totalProposals' => $this->resource['totalProposals'],
            'proposals' => ProposalResource::collection($this->resource['proposals']),
        ];

        // Add origin-specific data
        if ($this->resource['origin'] === 'student_group') {
            $data['studentGroupId'] = $this->resource['studentGroupId'] ?? null;
            $data['studentGroup'] = $this->resource['studentGroup']
                ? new StudentGroupResource($this->resource['studentGroup'])
                : null;
            $data['submitter'] = $this->resource['submitter']
                ? new UserResource($this->resource['submitter'])
                : null;
        } elseif ($this->resource['origin'] === 'supervisor') {
            $data['supervisorId'] = $this->resource['supervisorId'];
            $data['supervisor'] = $this->resource['supervisor']
                ? new UserResource($this->resource['supervisor'])
                : null;
        } elseif ($this->resource['origin'] === 'committee') {
            $data['submitter'] = $this->resource['submitter']
                ? new UserResource($this->resource['submitter'])
                : null;
        }

        return $data;
    }
}
