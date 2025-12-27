<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'status',
        'supervisor_id',
        'max_students',
        'current_students',
        'specialization',
        'keywords',
        'committee_id',
    ];

    protected $casts = [
        'keywords' => 'array',
    ];

    /**
     * Get the supervisor of the project
     */
    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    /**
     * Get the students assigned to the project
     */
    public function students(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_student', 'project_id', 'student_id')
            ->withTimestamps();
    }

    /**
     * Get the group working on this project
     */
    public function group(): HasOne
    {
        return $this->hasOne(ProjectGroup::class);
    }

    /**
     * Get the discussion committee members assigned to this project
     */
    public function committeeMembers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'committee_assignments')
            ->withTimestamps();
    }

    /**
     * Get all documents for this project
     */
    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    /**
     * Get all grades for this project
     */
    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class);
    }

    /**
     * Get all registrations for this project
     */
    public function registrations(): HasMany
    {
        return $this->hasMany(ProjectRegistration::class);
    }

    /**
     * Get all proposals for this project
     */
    public function proposals(): HasMany
    {
        return $this->hasMany(Proposal::class);
    }

    /**
     * Get all supervisor notes for this project
     */
    public function supervisorNotes(): HasMany
    {
        return $this->hasMany(SupervisorNote::class);
    }

    /**
     * Get all milestones for this project
     */
    public function milestones(): HasMany
    {
        return $this->hasMany(ProjectMilestone::class);
    }

    /**
     * Get all meetings for this project
     */
    public function meetings(): HasMany
    {
        return $this->hasMany(ProjectMeeting::class);
    }

    /**
     * Get all requests related to this project
     */
    public function requests(): HasMany
    {
        return $this->hasMany(ProjectRequest::class);
    }

    /**
     * Check if project is available for registration
     */
    public function isAvailableForRegistration(): bool
    {
        return $this->status === 'available_for_registration' 
            && $this->current_students < $this->max_students;
    }

    /**
     * Check if project has available spots
     */
    public function hasAvailableSpots(): bool
    {
        return $this->current_students < $this->max_students;
    }
}

