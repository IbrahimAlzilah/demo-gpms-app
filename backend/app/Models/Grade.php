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
        'fd1_final_grade',
        'fd2_final_grade',
        'fd1_adjustment',
        'fd2_adjustment',
        'is_approved',
        'fd1_approved',
        'fd2_approved',
        'fd1_published',
        'fd2_published',
        'approved_at',
        'approved_by',
    ];

    protected $casts = [
        'supervisor_grade' => 'array',
        'committee_grade' => 'array',
        'final_grade' => 'decimal:2',
        'fd1_final_grade' => 'decimal:2',
        'fd2_final_grade' => 'decimal:2',
        'fd1_adjustment' => 'decimal:2',
        'fd2_adjustment' => 'decimal:2',
        'is_approved' => 'boolean',
        'fd1_approved' => 'boolean',
        'fd2_approved' => 'boolean',
        'fd1_published' => 'boolean',
        'fd2_published' => 'boolean',
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

    /**
     * Get FD1 evaluations for this student
     */
    public function fd1Evaluations()
    {
        return DefenseEvaluation::where('project_id', $this->project_id)
            ->where('student_id', $this->student_id)
            ->where('defense_stage', 'fd1')
            ->get();
    }

    /**
     * Get FD2 evaluations for this student
     */
    public function fd2Evaluations()
    {
        return DefenseEvaluation::where('project_id', $this->project_id)
            ->where('student_id', $this->student_id)
            ->where('defense_stage', 'fd2')
            ->get();
    }

    /**
     * Get FD1 approval status for this project
     */
    public function fd1Approval()
    {
        return DefenseApproval::where('project_id', $this->project_id)
            ->where('defense_stage', 'fd1')
            ->first();
    }

    /**
     * Get FD2 approval status for this project
     */
    public function fd2Approval()
    {
        return DefenseApproval::where('project_id', $this->project_id)
            ->where('defense_stage', 'fd2')
            ->first();
    }

    /**
     * Calculate FD1 final grade from all evaluations
     *
     * Formula: (grade/100)/5 for committee, (grade/100)/2 for supervisor
     * Final grade scaled to 0-100
     */
    public function calculateFD1FinalGrade(): ?float
    {
        return $this->calculateStageFinalGrade('fd1');
    }

    /**
     * Calculate FD2 final grade from all evaluations
     *
     * Formula: (grade/100)/5 for committee, (grade/100)/2 for supervisor
     * Final grade scaled to 0-100
     */
    public function calculateFD2FinalGrade(): ?float
    {
        return $this->calculateStageFinalGrade('fd2');
    }

    /**
     * Calculate final grade for a defense stage
     */
    protected function calculateStageFinalGrade(string $stage): ?float
    {
        $evaluations = $stage === 'fd1' ? $this->fd1Evaluations() : $this->fd2Evaluations();

        if ($evaluations->isEmpty()) {
            return null;
        }

        $supervisorEval = $evaluations->where('evaluator_role', 'supervisor')->first();
        $committeeEvals = $evaluations->where('evaluator_role', 'committee_member');
        $projectCommitteeEvals = $evaluations->where('evaluator_role', 'project_committee');

        $supervisorContribution = $supervisorEval ? (($supervisorEval->normalized_score / 100) / 2) : 0;

        $committeeContribution = 0;
        foreach ($committeeEvals as $eval) {
            $committeeContribution += (($eval->normalized_score / 100) / 5);
        }

        $projectCommitteeContribution = 0;
        foreach ($projectCommitteeEvals as $eval) {
            $projectCommitteeContribution += (($eval->normalized_score / 100) / 5);
        }

        $rawSum = $supervisorContribution + $committeeContribution + $projectCommitteeContribution;

        return $rawSum > 0 ? round($rawSum * 100, 2) : null;
    }

    /**
     * Check if FD1 is locked (approved or published)
     */
    public function isFD1Locked(): bool
    {
        $approval = $this->fd1Approval();
        return $approval && $approval->isLocked();
    }

    /**
     * Check if FD2 is locked (approved or published)
     */
    public function isFD2Locked(): bool
    {
        $approval = $this->fd2Approval();
        return $approval && $approval->isLocked();
    }

    /**
     * Get supervisor score safely
     */
    public function getSupervisorScore(): ?float
    {
        return $this->supervisor_grade['score'] ?? null;
    }

    /**
     * Get committee aggregate score (handles legacy score or members average)
     */
    public function getCommitteeScore(): ?float
    {
        $grade = $this->committee_grade;
        if (!is_array($grade)) {
            return null;
        }

        // Direct score
        if (isset($grade['score'])) {
            return (float) $grade['score'];
        }

        // Members average
        $members = $grade['members'] ?? [];
        if (empty($members)) {
            return null;
        }

        $scores = [];
        foreach ($members as $member) {
            if (isset($member['score'])) {
                $scores[] = (float) $member['score'];
            }
        }

        if (empty($scores)) {
            return null;
        }

        return round(array_sum($scores) / count($scores), 2);
    }

    /**
     * Check if grade is ready for approval
     */
    public function isReadyForApproval(): bool
    {
        return empty($this->getApprovalValidationErrors());
    }

    /**
     * Get validation errors preventing approval
     */
    public function getApprovalValidationErrors(): array
    {
        $errors = [];

        // Must have final grade calculated
        if ($this->final_grade === null && $this->fd1_final_grade === null && $this->fd2_final_grade === null) {
            $errors[] = 'Final grade has not been calculated';
        }

        return $errors;
    }

    /**
     * Get evaluations for a specific stage, using eager loaded relation if available
     */
    protected function getEvaluationsForStage(string $stage)
    {
        // Revert to direct query for reliability
        return DefenseEvaluation::where('project_id', $this->project_id)
            ->where('student_id', $this->student_id)
            ->where('defense_stage', $stage)
            ->get();
    }

    public function getFD1SupervisorScore(): ?float
    {
        $eval = $this->getEvaluationsForStage('fd1')->firstWhere('evaluator_role', 'supervisor');
        return $eval ? (float) $eval->normalized_score : null;
    }

    public function getFD1CommitteeScore(): ?float
    {
        $evals = $this->getEvaluationsForStage('fd1')->where('evaluator_role', 'committee_member');
        return $evals->isNotEmpty() ? (float) $evals->avg('normalized_score') : null;
    }

    public function getFD2SupervisorScore(): ?float
    {
        $eval = $this->getEvaluationsForStage('fd2')->firstWhere('evaluator_role', 'supervisor');
        return $eval ? (float) $eval->normalized_score : null;
    }

    public function getFD2CommitteeScore(): ?float
    {
        $evals = $this->getEvaluationsForStage('fd2')->where('evaluator_role', 'committee_member');
        return $evals->isNotEmpty() ? (float) $evals->avg('normalized_score') : null;
    }
}

