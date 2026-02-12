<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DefenseEvaluation extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'student_id',
        'evaluator_id',
        'evaluator_role',
        'defense_stage',
        'score',
        'max_score',
        'criteria',
        'notes',
        'created_by',
        'modified_by',
    ];

    protected $casts = [
        'score' => 'decimal:2',
        'max_score' => 'decimal:2',
        'criteria' => 'array',
    ];

    /**
     * Get the project this evaluation is for
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the student this evaluation is for
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the evaluator who submitted this evaluation
     */
    public function evaluator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'evaluator_id');
    }

    /**
     * Get the user who created this record
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last modified this record
     */
    public function modifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'modified_by');
    }

    /**
     * Scope a query to only include evaluations for a specific stage
     */
    public function scopeStage($query, string $stage)
    {
        return $query->where('defense_stage', $stage);
    }

    /**
     * Scope a query to only include FD1 evaluations
     */
    public function scopeFd1($query)
    {
        return $query->where('defense_stage', 'fd1');
    }

    /**
     * Scope a query to only include FD2 evaluations
     */
    public function scopeFd2($query)
    {
        return $query->where('defense_stage', 'fd2');
    }

    /**
     * Scope a query to only include supervisor evaluations
     */
    public function scopeBySupervisor($query)
    {
        return $query->where('evaluator_role', 'supervisor');
    }

    /**
     * Scope a query to only include committee member evaluations
     */
    public function scopeByCommitteeMember($query)
    {
        return $query->where('evaluator_role', 'committee_member');
    }

    /**
     * Scope a query to only include project committee evaluations
     */
    public function scopeByProjectCommittee($query)
    {
        return $query->where('evaluator_role', 'project_committee');
    }

    /**
     * Scope a query to only include evaluations by a specific evaluator
     */
    public function scopeByEvaluator($query, int $evaluatorId)
    {
        return $query->where('evaluator_id', $evaluatorId);
    }

    /**
     * Check if this evaluation can be modified by the given user
     */
    public function canModify(User $user): bool
    {
        // Project committee can modify any evaluation
        if ($user->isProjectsCommittee()) {
            return true;
        }

        // Check if the stage is locked (approved)
        $approval = DefenseApproval::where('project_id', $this->project_id)
            ->where('defense_stage', $this->defense_stage)
            ->first();

        if ($approval && $approval->status !== 'pending') {
            return false;
        }

        // Evaluator can modify their own evaluation if not locked
        return $this->evaluator_id === $user->id;
    }

    /**
     * Get the percentage score (score / max_score * 100)
     */
    public function getPercentageAttribute(): float
    {
        if ($this->max_score == 0) {
            return 0;
        }
        return ($this->score / $this->max_score) * 100;
    }

    /**
     * Get the normalized score (out of 100)
     */
    public function getNormalizedScoreAttribute(): float
    {
        return $this->percentage;
    }
}
