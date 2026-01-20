<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudentGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'group_code',
        'leader_id',
        'status',
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function (StudentGroup $group) {
            if (empty($group->group_code)) {
                $year = date('Y');
                // Find the last group code for the current year to determine the next sequence
                $lastGroup = static::where('group_code', 'like', "GP-{$year}-%")
                    ->orderBy('group_code', 'desc')
                    ->first();

                $sequence = 1;
                if ($lastGroup) {
                    // Extract sequence number from the last group code (GP-YYYY-XXXX)
                    $parts = explode('-', $lastGroup->group_code);
                    if (count($parts) === 3) {
                        $sequence = intval($parts[2]) + 1;
                    }
                }

                // Format: GP-YYYY-XXXX (e.g., GP-2026-0001)
                $group->group_code = sprintf('GP-%s-%04d', $year, $sequence);
            }
        });
    }

    /**
     * Get the leader of the group
     */
    public function leader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'leader_id');
    }

    /**
     * Get all members of the group
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'student_group_members', 'group_id', 'student_id')
            ->withTimestamps();
    }

    /**
     * Get all invitations for this group
     */
    public function invitations(): HasMany
    {
        return $this->hasMany(StudentGroupInvitation::class, 'group_id');
    }

    /**
     * Get all join requests for this group
     */
    public function joinRequests(): HasMany
    {
        return $this->hasMany(StudentGroupJoinRequest::class, 'group_id');
    }

    /**
     * Get projects assigned to this group
     */
    public function assignedProjects(): HasMany
    {
        return $this->hasMany(Project::class, 'assigned_group_id');
    }

    /**
     * Check if group is full based on settings
     */
    public function isFull(): bool
    {
        $maxMembers = app(\App\Services\SettingsService::class)->getGroupMaxMembers();
        $totalMembers = $this->getTotalMemberCount(); // Includes leader
        return $totalMembers >= $maxMembers;
    }

    /**
     * Check if group meets requirements for project registration/proposal submission
     * Requires minimum 2 members and maximum 5 members
     */
    public function meetsRegistrationRequirements(): bool
    {
        $minMembers = app(\App\Services\SettingsService::class)->getGroupMinMembers();
        $maxMembers = app(\App\Services\SettingsService::class)->getGroupMaxMembers();
        $totalMembers = $this->getTotalMemberCount(); // Includes leader
        return $totalMembers >= $minMembers && $totalMembers <= $maxMembers;
    }

    /**
     * Check if a user is a member (including leader)
     */
    public function hasMember(int $userId): bool
    {
        // Check if user is the leader
        if ($this->leader_id === $userId) {
            return true;
        }
        // Check if user is in the members pivot table
        return $this->members()->where('users.id', $userId)->exists();
    }

    /**
     * Check if group meets minimum member requirement
     */
    public function meetsMinimumMembers(): bool
    {
        $minMembers = app(\App\Services\SettingsService::class)->getGroupMinMembers();
        $totalMembers = $this->getTotalMemberCount(); // Includes leader
        return $totalMembers >= $minMembers;
    }

    /**
     * Get total member count including leader
     */
    public function getTotalMemberCount(): int
    {
        return $this->members()->count() + 1; // +1 for leader
    }
}
