<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GroupRegistrationRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_group_id',
        'submitted_by',
        'status',
        'submitted_at',
        'reviewed_at',
        'reviewed_by',
        'review_comments',
        'approved_project_id',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    /**
     * Get the student group that submitted this request
     */
    public function studentGroup(): BelongsTo
    {
        return $this->belongsTo(StudentGroup::class, 'student_group_id');
    }

    /**
     * Get the user who submitted this request (group leader)
     */
    public function submitter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    /**
     * Get the user who reviewed this request
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Get the approved project (if any)
     */
    public function approvedProject(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'approved_project_id');
    }

    /**
     * Get all project registrations in this request
     */
    public function projectRegistrations(): HasMany
    {
        return $this->hasMany(ProjectRegistration::class, 'group_registration_request_id');
    }

    /**
     * Check if request is pending
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if request is approved
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if request can be cancelled
     */
    public function canBeCancelled(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Scope: Get pending requests
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope: Get requests by group
     */
    public function scopeByGroup($query, int $groupId)
    {
        return $query->where('student_group_id', $groupId);
    }

    /**
     * Scope: Get requests by status
     */
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }
}
