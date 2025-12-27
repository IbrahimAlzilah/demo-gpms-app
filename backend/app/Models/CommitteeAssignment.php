<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommitteeAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'committee_member_id',
    ];

    /**
     * Get the project this assignment is for
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the committee member assigned
     */
    public function committeeMember(): BelongsTo
    {
        return $this->belongsTo(User::class, 'committee_member_id');
    }
}

