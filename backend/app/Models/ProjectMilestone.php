<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectMilestone extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'title',
        'description',
        'due_date',
        'type',
        'completed',
        'completed_at',
    ];

    protected $casts = [
        'due_date' => 'date',
        'completed' => 'boolean',
        'completed_at' => 'datetime',
    ];

    /**
     * Get the project this milestone belongs to
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Check if milestone is overdue
     */
    public function isOverdue(): bool
    {
        return !$this->completed && $this->due_date < now();
    }
}

