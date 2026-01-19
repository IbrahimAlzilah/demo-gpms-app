<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectCommittee extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'department',
    ];

    /**
     * Users that belong to this project committee.
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_committee_user')
            ->withTimestamps();
    }

    /**
     * Projects managed by this committee.
     */
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class, 'project_committee_id');
    }
}

