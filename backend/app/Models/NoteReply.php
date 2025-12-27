<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NoteReply extends Model
{
    use HasFactory;

    protected $fillable = [
        'note_id',
        'author_id',
        'content',
    ];

    /**
     * Get the note this reply belongs to
     */
    public function note(): BelongsTo
    {
        return $this->belongsTo(SupervisorNote::class, 'note_id');
    }

    /**
     * Get the user who wrote the reply
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}

