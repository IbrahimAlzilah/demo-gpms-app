<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ProjectMeeting extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'scheduled_by',
        'scheduled_date',
        'duration',
        'location',
        'agenda',
        'notes',
    ];

    protected $casts = [
        'scheduled_date' => 'datetime',
        'duration' => 'integer',
    ];

    /**
     * Get the project this meeting belongs to
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the user who scheduled the meeting
     */
    public function scheduledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'scheduled_by');
    }

    /**
     * Get all attendees of the meeting
     */
    public function attendees(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_meeting_attendee', 'meeting_id', 'attendee_id')
            ->withTimestamps();
    }
}

