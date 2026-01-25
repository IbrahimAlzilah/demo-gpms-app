<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\ProjectStatus;

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
        'project_committee_id',
        'discussion_committee_id',
        'supervisor_approval_status',
        'supervisor_approval_comments',
        'supervisor_approval_at',
        'assigned_group_id',
        'reserved_at',
    ];

    protected $casts = [
        'keywords' => 'array',
        'status' => ProjectStatus::class,
        'supervisor_approval_at' => 'datetime',
        'reserved_at' => 'datetime',
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
     * Get the student group assigned to this project
     */
    public function assignedGroup(): BelongsTo
    {
        return $this->belongsTo(StudentGroup::class, 'assigned_group_id');
    }

    /**
     * Get the discussion committee members assigned to this project
     */
    public function committeeMembers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'committee_assignments', 'project_id', 'committee_member_id')
            ->withTimestamps();
    }

    /**
     * Get the project committee associated with this project.
     */
    public function projectCommittee(): BelongsTo
    {
        return $this->belongsTo(ProjectCommittee::class, 'project_committee_id');
    }

    /**
     * Get the discussion committee associated with this project.
     */
    public function discussionCommittee(): BelongsTo
    {
        return $this->belongsTo(DiscussionCommittee::class, 'discussion_committee_id');
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
     * Time periods this project spans.
     */
    public function timePeriods(): BelongsToMany
    {
        return $this->belongsToMany(TimePeriod::class, 'project_time_period')
            ->withTimestamps();
    }

    /**
     * Check if project is available for registration
     */
    public function isAvailableForRegistration(): bool
    {
        // Project is not available if already assigned to a group
        if ($this->assigned_group_id) {
            return false;
        }
        
        return $this->status === ProjectStatus::AVAILABLE_FOR_REGISTRATION
            && $this->current_students < $this->max_students;
    }

    /**
     * Check if project has available spots
     */
    public function hasAvailableSpots(): bool
    {
        return $this->current_students < $this->max_students;
    }

    /**
     * Check if project is visible to students
     */
    public function isVisibleToStudents(): bool
    {
        return $this->status?->isVisibleToStudents() ?? false;
    }

    /**
     * Check if project is active
     */
    public function isActive(): bool
    {
        return $this->status?->isActive() ?? false;
    }

    /**
     * Check if project is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === ProjectStatus::COMPLETED;
    }
}

