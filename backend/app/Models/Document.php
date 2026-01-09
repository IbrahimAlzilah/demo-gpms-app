<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'project_id',
        'file_name',
        'file_path',
        'file_size',
        'mime_type',
        'submitted_by',
        'reviewed_by',
        'reviewed_at',
        'review_status',
        'review_comments',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
        'file_size' => 'integer',
    ];

    /**
     * Get the project this document belongs to
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the user who submitted the document
     */
    public function submitter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    /**
     * Get the user who reviewed the document
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Check if document is pending review
     */
    public function isPending(): bool
    {
        return $this->review_status === 'pending';
    }

    /**
     * Check if document is approved
     */
    public function isApproved(): bool
    {
        return $this->review_status === 'approved';
    }

    /**
     * Get the file URL for download
     */
    public function getFileUrlAttribute(): string
    {
        return url('/api/student/documents/' . $this->id . '/download');
    }
}

