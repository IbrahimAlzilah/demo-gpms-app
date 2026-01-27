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
     * Period is active if current date is between start_date and end_date (inclusive)
     * The end_date is considered valid for the entire day
     */
    public function isCurrentlyActive(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $now = now()->startOfDay();
        return $now >= $this->start_date->startOfDay()
            && $now <= $this->end_date->startOfDay();
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

    /**
     * Check if period should be active based on current date
     * Returns true if start_date has been reached and end_date has not passed
     */
    public function shouldBeActive(): bool
    {
        $now = now()->startOfDay();
        return $now >= $this->start_date->startOfDay()
            && $now <= $this->end_date->startOfDay();
    }

    /**
     * Check if period has passed its end date
     */
    public function hasEnded(): bool
    {
        $now = now()->startOfDay();
        return $now > $this->end_date->startOfDay();
    }

    /**
     * Check if period start date is in the future
     */
    public function isScheduled(): bool
    {
        $now = now()->startOfDay();
        return $now < $this->start_date->startOfDay();
    }
}

