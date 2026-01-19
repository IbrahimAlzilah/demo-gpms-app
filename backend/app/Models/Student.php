<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'student_id',
        'major',
        'academic_level',
    ];

    /**
     * Get the user associated with this student profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

