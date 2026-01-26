<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentGroupJoinRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'group_id',
        'student_id',
        'status',
        'message',
        'requested_at',
        'reviewed_at',
        'reviewed_by',
        'review_comments',
    ];

    /**
     * Check if request is cancelled
     */
    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    protected $casts = [
        'requested_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    /**
     * Get the group this join request belongs to
     */
    public function group(): BelongsTo
    {
        return $this->belongsTo(StudentGroup::class, 'group_id');
    }

    /**
     * Get the student who made the request
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the user who reviewed the request
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Check if request is pending
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }
}
