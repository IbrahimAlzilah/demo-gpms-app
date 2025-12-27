<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SupervisorNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'supervisor_id',
        'content',
    ];

    /**
     * Get the project this note belongs to
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the supervisor who wrote the note
     */
    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    /**
     * Get all replies to this note
     */
    public function replies(): HasMany
    {
        return $this->hasMany(NoteReply::class, 'note_id');
    }
}

