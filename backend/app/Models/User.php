<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'student_id',
        'emp_id',
        'department',
        'phone',
        'status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Check if user has a specific role
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    /**
     * Check if user is a student
     */
    public function isStudent(): bool
    {
        return $this->role === 'student';
    }

    /**
     * Check if user is a supervisor
     */
    public function isSupervisor(): bool
    {
        return $this->role === 'supervisor';
    }

    /**
     * Check if user is a discussion committee member
     */
    public function isDiscussionCommittee(): bool
    {
        return $this->role === 'discussion_committee';
    }

    /**
     * Check if user is a projects committee member
     */
    public function isProjectsCommittee(): bool
    {
        return $this->role === 'projects_committee';
    }

    /**
     * Check if user is an admin
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Scope a query to only include users with a specific role.
     */
    public function scopeRole($query, string $role)
    {
        return $query->where('role', $role);
    }

    /**
     * Scope a query to only include active users.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    // Relationships
    public function proposals(): HasMany
    {
        return $this->hasMany(Proposal::class, 'submitter_id');
    }

    public function supervisedProjects(): HasMany
    {
        return $this->hasMany(Project::class, 'supervisor_id');
    }

    public function requests(): HasMany
    {
        return $this->hasMany(ProjectRequest::class, 'student_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function projectRegistrations(): HasMany
    {
        return $this->hasMany(ProjectRegistration::class, 'student_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class, 'submitted_by');
    }

    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class, 'student_id');
    }

    public function supervisorNotes(): HasMany
    {
        return $this->hasMany(SupervisorNote::class, 'supervisor_id');
    }

    public function noteReplies(): HasMany
    {
        return $this->hasMany(NoteReply::class, 'author_id');
    }

    public function ledGroups(): HasMany
    {
        return $this->hasMany(ProjectGroup::class, 'leader_id');
    }

    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(ProjectGroup::class, 'project_group_member', 'member_id', 'group_id')
            ->withTimestamps();
    }

    public function sentInvitations(): HasMany
    {
        return $this->hasMany(GroupInvitation::class, 'inviter_id');
    }

    public function receivedInvitations(): HasMany
    {
        return $this->hasMany(GroupInvitation::class, 'invitee_id');
    }

    public function scheduledMeetings(): HasMany
    {
        return $this->hasMany(ProjectMeeting::class, 'scheduled_by');
    }

    public function meetingAttendances(): BelongsToMany
    {
        return $this->belongsToMany(ProjectMeeting::class, 'project_meeting_attendee', 'attendee_id', 'meeting_id')
            ->withTimestamps();
    }

    public function committeeAssignments(): HasMany
    {
        return $this->hasMany(CommitteeAssignment::class, 'committee_member_id');
    }

    public function assignedProjects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'committee_assignments', 'committee_member_id', 'project_id')
            ->withTimestamps();
    }

    public function createdPeriods(): HasMany
    {
        return $this->hasMany(TimePeriod::class, 'created_by');
    }
}
