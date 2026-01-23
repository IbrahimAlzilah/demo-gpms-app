<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\Proposal;
use App\Models\ProposalSubmission;
use App\Enums\ProposalSubmissionStatus;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Check if proposal_submissions table exists and has submitted_at column
        if (!Schema::hasTable('proposal_submissions')) {
            throw new \Exception('proposal_submissions table does not exist. Please run the previous migrations first.');
        }

        if (!Schema::hasColumn('proposal_submissions', 'submitted_at')) {
            throw new \Exception('submitted_at column does not exist in proposal_submissions table. Please run the previous migrations first.');
        }

        // Group proposals by submitter_id and student_group_id
        $proposals = Proposal::whereNull('submission_id')
            ->orderBy('submitter_id')
            ->orderBy('student_group_id')
            ->orderBy('created_at')
            ->get()
            ->groupBy(function ($proposal) {
                return $proposal->submitter_id . '_' . ($proposal->student_group_id ?? 'null');
            });

        foreach ($proposals as $groupKey => $groupProposals) {
            $firstProposal = $groupProposals->first();
            
            // Determine submission status based on proposal status
            $submissionStatus = ProposalSubmissionStatus::DRAFT->value;
            $submittedAt = null;
            
            // Check if any proposal has been reviewed
            $hasReviewed = $groupProposals->contains(function ($proposal) {
                return in_array($proposal->status, ['approved', 'rejected', 'requires_modification']);
            });
            
            if ($hasReviewed) {
                // If any proposal is approved, submission is approved
                if ($groupProposals->contains(function ($proposal) {
                    return $proposal->status === 'approved';
                })) {
                    $submissionStatus = ProposalSubmissionStatus::APPROVED->value;
                }
                // If any proposal is rejected, submission is rejected
                elseif ($groupProposals->contains(function ($proposal) {
                    return $proposal->status === 'rejected';
                })) {
                    $submissionStatus = ProposalSubmissionStatus::REJECTED->value;
                }
                // If any proposal requires modification, submission requires modification
                elseif ($groupProposals->contains(function ($proposal) {
                    return $proposal->status === 'requires_modification';
                })) {
                    $submissionStatus = ProposalSubmissionStatus::REQUIRES_MODIFICATION->value;
                }
                // Otherwise, under review
                else {
                    $submissionStatus = ProposalSubmissionStatus::UNDER_REVIEW->value;
                }
                
                // Set submitted_at to the earliest proposal created_at
                $submittedAt = $groupProposals->min('created_at');
            } else {
                // If all proposals are pending_review, submission is submitted
                if ($groupProposals->every(function ($proposal) {
                    return $proposal->status === 'pending_review';
                })) {
                    $submissionStatus = ProposalSubmissionStatus::SUBMITTED->value;
                    $submittedAt = $groupProposals->min('created_at');
                }
            }

            // Use DB::table() to avoid model fillable issues
            $submissionId = DB::table('proposal_submissions')->insertGetId([
                'submitter_id' => $firstProposal->submitter_id,
                'student_group_id' => $firstProposal->student_group_id,
                'status' => $submissionStatus,
                'review_notes' => $groupProposals->firstWhere('review_notes', '!=', null)?->review_notes,
                'reviewed_by' => $groupProposals->firstWhere('reviewed_by', '!=', null)?->reviewed_by,
                'reviewed_at' => $groupProposals->firstWhere('reviewed_at', '!=', null)?->reviewed_at,
                'submitted_at' => $submittedAt,
                'created_at' => $groupProposals->min('created_at'),
                'updated_at' => $groupProposals->max('updated_at'),
            ]);

            // Update all proposals in this group to link to the submission
            foreach ($groupProposals as $proposal) {
                $proposal->update(['submission_id' => $submissionId]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove submission_id from all proposals
        DB::table('proposals')->update(['submission_id' => null]);
        
        // Delete all proposal submissions
        DB::table('proposal_submissions')->truncate();
    }
};
