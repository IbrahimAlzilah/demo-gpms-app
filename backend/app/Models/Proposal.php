<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Proposal extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'objectives',
        'methodology',
        'expected_outcomes',
        'submitter_id',
        'status',
        'review_notes',
        'reviewed_by',
        'reviewed_at',
        'project_id',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    /**
     * Get the user who submitted the proposal
     */
    public function submitter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitter_id');
    }

    /**
     * Get the user who reviewed the proposal
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Get the project created from this proposal
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Check if proposal is pending review
     */
    public function isPending(): bool
    {
        return $this->status === 'pending_review';
    }

    /**
     * Check if proposal is approved
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if proposal is rejected
     */
    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }
}

