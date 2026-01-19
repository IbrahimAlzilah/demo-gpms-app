<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class TimePeriod extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'start_date',
        'end_date',
        'is_active',
        'academic_year',
        'semester',
        'description',
        'created_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
    ];

    /**
     * Get the user who created this period
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Projects that span this time period.
     */
    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_time_period')
            ->withTimestamps();
    }

    /**
     * Check if period is currently active
     */
    public function isCurrentlyActive(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $now = now()->toDateString();
        return $now >= $this->start_date->toDateString() 
            && $now <= $this->end_date->toDateString();
    }

    /**
     * Check if a date is within this period
     */
    public function containsDate(string $date): bool
    {
        $checkDate = \Carbon\Carbon::parse($date)->toDateString();
        return $checkDate >= $this->start_date->toDateString() 
            && $checkDate <= $this->end_date->toDateString();
    }
}

