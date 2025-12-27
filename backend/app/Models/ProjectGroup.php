<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'leader_id',
        'max_members',
    ];

    /**
     * Get the project this group belongs to
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
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
        return $this->belongsToMany(User::class, 'project_group_member', 'group_id', 'member_id')
            ->withTimestamps();
    }

    /**
     * Get all invitations for this group
     */
    public function invitations(): HasMany
    {
        return $this->hasMany(GroupInvitation::class, 'group_id');
    }

    /**
     * Check if group is full
     */
    public function isFull(): bool
    {
        return $this->members()->count() >= $this->max_members;
    }

    /**
     * Check if a user is a member
     */
    public function hasMember(int $userId): bool
    {
        return $this->members()->where('users.id', $userId)->exists();
    }
}

