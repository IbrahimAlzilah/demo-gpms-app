<?php

namespace App\Services;

use App\Models\Grade;
use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class EvaluationService
{
    /**
     * Submit supervisor grade
     */
    public function submitSupervisorGrade(
        Project $project,
        User $student,
        array $gradeData,
        User $supervisor
    ): Grade {
        if ($project->supervisor_id !== $supervisor->id) {
            throw new \Exception('Unauthorized to grade this project');
        }

        return DB::transaction(function () use ($project, $student, $gradeData) {
            $grade = Grade::firstOrNew([
                'project_id' => $project->id,
                'student_id' => $student->id,
            ]);

            $grade->supervisor_grade = [
                'score' => $gradeData['score'],
                'maxScore' => $gradeData['maxScore'],
                'criteria' => $gradeData['criteria'],
                'comments' => $gradeData['comments'] ?? null,
                'evaluatedAt' => now()->toISOString(),
                'evaluatedBy' => auth()->id(),
            ];

            // Calculate final grade if both grades exist
            if ($grade->committee_grade) {
                $grade->final_grade = $grade->calculateFinalGrade();
            }

            $grade->save();

            return $grade->fresh();
        });
    }

    /**
     * Submit committee grade
     */
    public function submitCommitteeGrade(
        Project $project,
        User $student,
        array $gradeData,
        User $evaluator,
        array $committeeMembers
    ): Grade {
        return DB::transaction(function () use ($project, $student, $gradeData, $evaluator, $committeeMembers) {
            $grade = Grade::firstOrNew([
                'project_id' => $project->id,
                'student_id' => $student->id,
            ]);

            $grade->committee_grade = [
                'score' => $gradeData['score'],
                'maxScore' => $gradeData['maxScore'],
                'criteria' => $gradeData['criteria'],
                'comments' => $gradeData['comments'] ?? null,
                'evaluatedAt' => now()->toISOString(),
                'evaluatedBy' => $evaluator->id,
                'committeeMembers' => $committeeMembers,
            ];

            // Calculate final grade if both grades exist
            if ($grade->supervisor_grade) {
                $grade->final_grade = $grade->calculateFinalGrade();
            }

            $grade->save();

            return $grade->fresh();
        });
    }

    /**
     * Approve final grade
     */
    public function approveGrade(Grade $grade, User $approver): Grade
    {
        $grade->update([
            'is_approved' => true,
            'approved_by' => $approver->id,
            'approved_at' => now(),
        ]);

        return $grade->fresh();
    }
}

