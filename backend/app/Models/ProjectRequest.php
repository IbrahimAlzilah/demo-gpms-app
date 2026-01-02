<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\RequestStatus;

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
        'status' => RequestStatus::class,
    ];

    /**
     * Get the student who created the request
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the related project
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
        return $this->status?->isPending() ?? false;
    }

    /**
     * Check if request is final
     */
    public function isFinal(): bool
    {
        return $this->status?->isFinal() ?? false;
    }

    /**
     * Check if request can be cancelled
     */
    public function canBeCancelled(): bool
    {
        return $this->status?->canBeCancelled() ?? false;
    }

    /**
     * Check if waiting for supervisor approval
     */
    public function needsSupervisorApproval(): bool
    {
        return $this->status === RequestStatus::PENDING;
    }

    /**
     * Check if waiting for committee approval
     */
    public function needsCommitteeApproval(): bool
    {
        return in_array($this->status, [
            RequestStatus::PENDING,
            RequestStatus::SUPERVISOR_APPROVED,
        ]);
    }
}
