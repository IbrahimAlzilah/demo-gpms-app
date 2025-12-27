<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GroupInvitation extends Model
{
    use HasFactory;

    protected $fillable = [
        'group_id',
        'inviter_id',
        'invitee_id',
        'status',
        'message',
    ];

    /**
     * Get the group this invitation is for
     */
    public function group(): BelongsTo
    {
        return $this->belongsTo(ProjectGroup::class, 'group_id');
    }

    /**
     * Get the user who sent the invitation
     */
    public function inviter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'inviter_id');
    }

    /**
     * Get the user who received the invitation
     */
    public function invitee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invitee_id');
    }

    /**
     * Check if invitation is pending
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if invitation is accepted
     */
    public function isAccepted(): bool
    {
        return $this->status === 'accepted';
    }
}

