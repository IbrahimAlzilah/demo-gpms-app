<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\ProposalSubmissionStatus;

class ProposalSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'submitter_id',
        'student_group_id',
        'status',
        'review_notes',
        'reviewed_by',
        'reviewed_at',
        'submitted_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
        'submitted_at' => 'datetime',
        'status' => ProposalSubmissionStatus::class,
    ];

    /**
     * Get the user who submitted the proposal submission
     */
    public function submitter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitter_id');
    }

    /**
     * Get the user who reviewed the proposal submission
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Get the student group that submitted this proposal submission
     */
    public function studentGroup(): BelongsTo
    {
        return $this->belongsTo(StudentGroup::class, 'student_group_id');
    }

    /**
     * Get all proposals in this submission
     */
    public function proposals(): HasMany
    {
        return $this->hasMany(Proposal::class, 'submission_id');
    }

    /**
     * Check if submission is pending review
     */
    public function isPending(): bool
    {
        return in_array($this->status, [
            ProposalSubmissionStatus::SUBMITTED,
            ProposalSubmissionStatus::UNDER_REVIEW
        ]);
    }

    /**
     * Check if submission is approved
     */
    public function isApproved(): bool
    {
        return $this->status === ProposalSubmissionStatus::APPROVED;
    }

    /**
     * Check if submission is rejected
     */
    public function isRejected(): bool
    {
        return $this->status === ProposalSubmissionStatus::REJECTED;
    }

    /**
     * Check if submission requires modification
     */
    public function requiresModification(): bool
    {
        return $this->status === ProposalSubmissionStatus::REQUIRES_MODIFICATION;
    }

    /**
     * Check if submission can be modified
     */
    public function canBeModified(): bool
    {
        return $this->status?->canBeModified() ?? false;
    }

    /**
     * Check if submission status is final
     */
    public function isFinal(): bool
    {
        return $this->status?->isFinal() ?? false;
    }

    /**
     * Check if new proposals can be added to this submission
     */
    public function allowsNewProposals(): bool
    {
        return $this->status?->allowsNewProposals() ?? false;
    }

    /**
     * Mark submission as submitted
     */
    public function markAsSubmitted(): void
    {
        $this->update([
            'status' => ProposalSubmissionStatus::SUBMITTED,
            'submitted_at' => now(),
        ]);
    }
}
