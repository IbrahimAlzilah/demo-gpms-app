<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Grade extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'student_id',
        'supervisor_grade',
        'committee_grade',
        'final_grade',
        'is_approved',
        'approved_at',
        'approved_by',
    ];

    protected $casts = [
        'supervisor_grade' => 'array',
        'committee_grade' => 'array',
        'final_grade' => 'decimal:2',
        'is_approved' => 'boolean',
        'approved_at' => 'datetime',
    ];

    /**
     * Get the project this grade is for
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the student this grade is for
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the user who approved the grade
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Calculate final grade from supervisor and committee grades
     */
    public function calculateFinalGrade(): ?float
    {
        $supervisorScore = $this->supervisor_grade['score'] ?? null;
        $committeeScore = $this->committee_grade['score'] ?? null;

        if ($supervisorScore === null && $committeeScore === null) {
            return null;
        }

        if ($supervisorScore !== null && $committeeScore !== null) {
            // Average of both grades
            return ($supervisorScore + $committeeScore) / 2;
        }

        return $supervisorScore ?? $committeeScore;
    }
}

