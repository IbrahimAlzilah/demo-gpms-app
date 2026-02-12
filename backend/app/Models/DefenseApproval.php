<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DefenseApproval extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'defense_stage',
        'status',
        'approved_by',
        'approved_at',
        'published_by',
        'published_at',
        'notes',
        'evaluations_ready_notified_at',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'published_at' => 'datetime',
        'evaluations_ready_notified_at' => 'datetime',
    ];

    /**
     * Get the project this approval is for
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the user who approved this stage
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the user who published this stage
     */
    public function publisher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'published_by');
    }

    /**
     * Scope a query to only include pending approvals
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include approved stages
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope a query to only include published stages
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    /**
     * Scope a query to only include FD1 approvals
     */
    public function scopeFd1($query)
    {
        return $query->where('defense_stage', 'fd1');
    }

    /**
     * Scope a query to only include FD2 approvals
     */
    public function scopeFd2($query)
    {
        return $query->where('defense_stage', 'fd2');
    }

    /**
     * Check if this stage can be approved
     */
    public function canApprove(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if this stage can be published
     */
    public function canPublish(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if this stage is pending
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if this stage is approved
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if this stage is published
     */
    public function isPublished(): bool
    {
        return $this->status === 'published';
    }

    /**
     * Check if this stage is locked (approved or published)
     */
    public function isLocked(): bool
    {
        return in_array($this->status, ['approved', 'published']);
    }
}
