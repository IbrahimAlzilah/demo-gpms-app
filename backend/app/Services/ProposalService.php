<?php

namespace App\Services;

use App\Models\Proposal;
use App\Models\User;
use App\Models\Project;
use Illuminate\Support\Facades\DB;

class ProposalService
{
    public function __construct(
        protected NotificationService $notificationService,
        protected ProjectService $projectService
    ) {}

    /**
     * Create a new proposal
     */
    public function create(array $data, User $submitter): Proposal
    {
        $proposal = Proposal::create([
            'title' => $data['title'],
            'description' => $data['description'],
            'objectives' => $data['objectives'],
            'methodology' => $data['methodology'] ?? null,
            'expected_outcomes' => $data['expected_outcomes'] ?? null,
            'submitter_id' => $submitter->id,
            'status' => 'pending_review',
        ]);

        // Notify projects committee members about new proposal
        $committeeMembers = User::where('role', 'projects_committee')
            ->where('status', 'active')
            ->pluck('id')
            ->toArray();

        if (!empty($committeeMembers)) {
            $submitterName = $submitter->name;
            $this->notificationService->createForUsers(
                $committeeMembers,
                "تم تقديم مقترح جديد: {$proposal->title} من قبل {$submitterName}",
                'proposal_submitted',
                'proposal',
                $proposal->id
            );
        }

        return $proposal;
    }

    /**
     * Approve a proposal and optionally create a project
     */
    public function approve(Proposal $proposal, User $reviewer, ?int $projectId = null): Proposal
    {
        return DB::transaction(function () use ($proposal, $reviewer, $projectId) {
            // If no project ID provided, create a new project from the proposal
            if (!$projectId) {
                $project = $this->projectService->createFromProposal([
                    'title' => $proposal->title,
                    'description' => $proposal->description,
                    'supervisor_id' => null, // Will be assigned later
                    'max_students' => 4,
                    'specialization' => null,
                    'keywords' => [],
                ], $proposal->id);
                
                $projectId = $project->id;
            }

            $proposal->update([
                'status' => 'approved',
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
                'project_id' => $projectId,
            ]);

            $proposal = $proposal->fresh();

            // Notify submitter about approval
            if ($proposal->submitter) {
                $this->notificationService->create(
                    $proposal->submitter,
                    "تم قبول مقترحك: {$proposal->title}",
                    'proposal_approved',
                    'proposal',
                    $proposal->id
                );
            }

            return $proposal;
        });
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

        $proposal = $proposal->fresh();

        // Notify submitter about rejection
        if ($proposal->submitter) {
            $message = "تم رفض مقترحك: {$proposal->title}";
            if ($reviewNotes) {
                $message .= "\nملاحظات المراجعة: {$reviewNotes}";
            }
            $this->notificationService->create(
                $proposal->submitter,
                $message,
                'proposal_rejected',
                'proposal',
                $proposal->id
            );
        }

        return $proposal;
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

        $proposal = $proposal->fresh();

        // Notify submitter about modification request
        if ($proposal->submitter) {
            $message = "يتطلب مقترحك تعديلات: {$proposal->title}\nملاحظات المراجعة: {$reviewNotes}";
            $this->notificationService->create(
                $proposal->submitter,
                $message,
                'proposal_modification_required',
                'proposal',
                $proposal->id
            );
        }

        return $proposal;
    }
}

