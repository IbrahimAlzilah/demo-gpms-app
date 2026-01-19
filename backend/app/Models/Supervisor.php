<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Supervisor extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'emp_id',
        'department',
    ];

    /**
     * Get the user associated with this supervisor profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

