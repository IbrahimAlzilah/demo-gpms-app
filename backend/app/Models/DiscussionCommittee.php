<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DiscussionCommittee extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'department',
    ];

    /**
     * Users that belong to this discussion committee.
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'discussion_committee_user')
            ->withTimestamps();
    }

    /**
     * Projects evaluated by this committee.
     */
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class, 'discussion_committee_id');
    }
}

