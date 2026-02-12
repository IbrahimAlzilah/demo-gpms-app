<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommitteeAssignmentHistory extends Model
{
    protected $fillable = [
        'project_id',
        'action',
        'committee_member_ids',
        'previous_committee_member_ids',
        'defense_stage',
        'performed_by',
        'notes',
    ];

    protected $casts = [
        'committee_member_ids' => 'array',
        'previous_committee_member_ids' => 'array',
    ];

    /**
     * Get the project associated with this history record.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the user who performed this action.
     */
    public function performedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}
