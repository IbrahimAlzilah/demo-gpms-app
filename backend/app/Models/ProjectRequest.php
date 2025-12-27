<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectRequest extends Model
{
    use HasFactory;

    protected $table = 'requests';

    protected $fillable = [
        'type',
        'student_id',
        'project_id',
        'reason',
        'status',
        'supervisor_approval',
        'committee_approval',
        'additional_data',
    ];

    protected $casts = [
        'supervisor_approval' => 'array',
        'committee_approval' => 'array',
        'additional_data' => 'array',
    ];

    /**
     * Get the student who made the request
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the project related to the request
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Check if request is pending
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if supervisor has approved
     */
    public function isSupervisorApproved(): bool
    {
        return $this->status === 'supervisor_approved';
    }

    /**
     * Check if committee has approved
     */
    public function isCommitteeApproved(): bool
    {
        return $this->status === 'committee_approved';
    }
}

