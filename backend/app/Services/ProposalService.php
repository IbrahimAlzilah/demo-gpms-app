<?php

namespace App\Services;

use App\Models\Proposal;
use App\Models\User;
use App\Models\Project;
use Illuminate\Support\Facades\DB;

class ProposalService
{
    /**
     * Create a new proposal
     */
    public function create(array $data, User $submitter): Proposal
    {
        return Proposal::create([
            'title' => $data['title'],
            'description' => $data['description'],
            'objectives' => $data['objectives'],
            'methodology' => $data['methodology'] ?? null,
            'expected_outcomes' => $data['expected_outcomes'] ?? null,
            'submitter_id' => $submitter->id,
            'status' => 'pending_review',
        ]);
    }

    /**
     * Approve a proposal and optionally create a project
     */
    public function approve(Proposal $proposal, User $reviewer, ?int $projectId = null): Proposal
    {
        DB::transaction(function () use ($proposal, $reviewer, $projectId) {
            $proposal->update([
                'status' => 'approved',
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
                'project_id' => $projectId,
            ]);
        });

        return $proposal->fresh();
    }

    /**
     * Reject a proposal
     */
    public function reject(Proposal $proposal, User $reviewer, ?string $reviewNotes = null): Proposal
    {
        $proposal->update([
            'status' => 'rejected',
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
            'review_notes' => $reviewNotes,
        ]);

        return $proposal->fresh();
    }

    /**
     * Request modification for a proposal
     */
    public function requestModification(Proposal $proposal, User $reviewer, string $reviewNotes): Proposal
    {
        $proposal->update([
            'status' => 'requires_modification',
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
            'review_notes' => $reviewNotes,
        ]);

        return $proposal->fresh();
    }
}

