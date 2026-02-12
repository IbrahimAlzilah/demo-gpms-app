<?php

namespace App\Http\Controllers\DiscussionCommittee;

use App\Http\Controllers\Controller;
use App\Models\DefenseEvaluation;
use App\Models\Project;
use App\Models\User;
use App\Services\DefenseEvaluationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DefenseEvaluationController extends Controller
{
    public function __construct(
        protected DefenseEvaluationService $evaluationService
    ) {}

    /**
     * Get projects assigned to this committee member with evaluation status
     * GET /discussion-committee/defense-evaluations/projects/{stage}
     */
    public function index(Request $request, string $stage): JsonResponse
    {
        // Validate stage
        if (!in_array($stage, ['fd1', 'fd2'])) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid defense stage. Must be fd1 or fd2.',
            ], 400);
        }

        $committeeMember = $request->user();

        // Get assigned projects
        $projects = Project::whereHas('committeeMembers', function ($q) use ($committeeMember) {
            $q->where('users.id', $committeeMember->id);
        })
        ->where('status', 'in_progress')
        ->with(['students', 'assignedGroup', 'supervisor'])
        ->withCount('students')
        ->get();

        $data = [];
        foreach ($projects as $project) {
            $stats = $this->evaluationService->getEvaluationStatistics($project, $stage);
            
            // Count how many students this committee member has evaluated
            $myEvaluationCount = DefenseEvaluation::where('project_id', $project->id)
                ->where('evaluator_id', $committeeMember->id)
                ->where('defense_stage', $stage)
                ->count();

            $data[] = [
                'project' => [
                    'id' => $project->id,
                    'title' => $project->title,
                    'description' => $project->description,
                    'specialization' => $project->specialization,
                    'studentsCount' => $project->students_count,
                    'supervisor' => [
                        'id' => $project->supervisor->id ?? null,
                        'name' => $project->supervisor->name ?? '',
                    ],
                ],
                'myProgress' => [
                    'evaluatedCount' => $myEvaluationCount,
                    'totalStudents' => $project->students_count,
                    'percentage' => $project->students_count > 0 
                        ? round(($myEvaluationCount / $project->students_count) * 100, 2) 
                        : 0,
                ],
                'overallStatus' => $stats,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Get MY evaluations only (cannot see other committee members' grades)
     * GET /discussion-committee/defense-evaluations/my-evaluations
     */
    public function getMyEvaluations(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'stage' => 'required|in:fd1,fd2',
        ]);

        $committeeMember = $request->user();
        $project = Project::findOrFail($validated['project_id']);

        // Verify assignment
        $isAssigned = $project->committeeMembers()->where('users.id', $committeeMember->id)->exists();
        if (!$isAssigned) {
            return response()->json([
                'success' => false,
                'message' => 'You are not assigned to this project\'s defense committee.',
            ], 403);
        }

        $students = $project->students;
        $data = [];

        foreach ($students as $student) {
            // CRITICAL: Only get THIS committee member's evaluation
            $myEvaluation = DefenseEvaluation::where('project_id', $project->id)
                ->where('student_id', $student->id)
                ->where('evaluator_id', $committeeMember->id) // SECURITY: Filter to current user only
                ->where('defense_stage', $validated['stage'])
                ->first();

            $data[] = [
                'student' => [
                    'id' => $student->id,
                    'name' => $student->name ?? '',
                    'email' => $student->email,
                    'studentId' => $student->student_id ?? $student->username,
                ],
                'myEvaluation' => $myEvaluation ? [
                    'id' => $myEvaluation->id,
                    'score' => $myEvaluation->score,
                    'maxScore' => $myEvaluation->max_score,
                    'normalizedScore' => $myEvaluation->normalized_score,
                    'criteria' => $myEvaluation->criteria,
                    'notes' => $myEvaluation->notes,
                    'createdAt' => $myEvaluation->created_at?->toISOString(),
                    'updatedAt' => $myEvaluation->updated_at?->toISOString(),
                ] : null,
            ];
        }

        // Check if stage is locked
        $approval = \App\Models\DefenseApproval::where('project_id', $project->id)
            ->where('defense_stage', $validated['stage'])
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'evaluations' => $data,
                'isLocked' => $approval?->isLocked() ?? false,
                'status' => $approval?->status ?? 'pending',
            ],
        ]);
    }

    /**
     * Submit evaluation (independent, cannot see others)
     * POST /discussion-committee/defense-evaluations
     */
    public function submitEvaluation(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'student_id' => 'required|exists:users,id',
            'stage' => 'required|in:fd1,fd2',
            'score' => 'required|numeric|min:0|max:100',
            'maxScore' => 'nullable|numeric|min:0',
            'criteria' => 'nullable|array',
            'notes' => 'nullable|string|max:5000',
        ]);

        $committeeMember = $request->user();
        $project = Project::findOrFail($validated['project_id']);
        $student = User::findOrFail($validated['student_id']);

        try {
            $evaluation = $this->evaluationService->submitCommitteeMemberEvaluation(
                $project,
                $student,
                $committeeMember,
                $validated['stage'],
                [
                    'score' => $validated['score'],
                    'maxScore' => $validated['maxScore'] ?? 100,
                    'criteria' => $validated['criteria'] ?? [],
                    'notes' => $validated['notes'] ?? null,
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Evaluation submitted successfully',
                'data' => [
                    'id' => $evaluation->id,
                    'score' => $evaluation->score,
                    'maxScore' => $evaluation->max_score,
                    'normalizedScore' => $evaluation->normalized_score,
                    'criteria' => $evaluation->criteria,
                    'notes' => $evaluation->notes,
                    'stage' => $evaluation->defense_stage,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Update own evaluation only
     * PUT /discussion-committee/defense-evaluations/{evaluation}
     */
    public function updateEvaluation(Request $request, int $evaluationId): JsonResponse
    {
        $validated = $request->validate([
            'score' => 'nullable|numeric|min:0|max:100',
            'maxScore' => 'nullable|numeric|min:0',
            'criteria' => 'nullable|array',
            'notes' => 'nullable|string|max:5000',
        ]);

        $committeeMember = $request->user();
        $evaluation = DefenseEvaluation::findOrFail($evaluationId);

        // SECURITY: Verify this committee member owns this evaluation
        if ($evaluation->evaluator_id !== $committeeMember->id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only update your own evaluations.',
            ], 403);
        }

        try {
            $updated = $this->evaluationService->updateEvaluation(
                $evaluation,
                $validated,
                $committeeMember
            );

            return response()->json([
                'success' => true,
                'message' => 'Evaluation updated successfully',
                'data' => [
                    'id' => $updated->id,
                    'score' => $updated->score,
                    'maxScore' => $updated->max_score,
                    'normalizedScore' => $updated->normalized_score,
                    'criteria' => $updated->criteria,
                    'notes' => $updated->notes,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get status of evaluations for a project/stage (no peer grades)
     * GET /discussion-committee/defense-evaluations/{project}/status/{stage}
     */
    public function getStatus(Request $request, Project $project, string $stage): JsonResponse
    {
        // Validate stage
        if (!in_array($stage, ['fd1', 'fd2'])) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid defense stage',
            ], 400);
        }

        $committeeMember = $request->user();

        // Verify assignment
        $isAssigned = $project->committeeMembers()->where('users.id', $committeeMember->id)->exists();
        if (!$isAssigned) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        // Get my evaluation count
        $myEvaluationCount = DefenseEvaluation::where('project_id', $project->id)
            ->where('evaluator_id', $committeeMember->id)
            ->where('defense_stage', $stage)
            ->count();

        $totalStudents = $project->students()->count();

        // Check if locked
        $approval = \App\Models\DefenseApproval::where('project_id', $project->id)
            ->where('defense_stage', $stage)
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'myProgress' => [
                    'evaluatedCount' => $myEvaluationCount,
                    'totalStudents' => $totalStudents,
                    'percentage' => $totalStudents > 0 
                        ? round(($myEvaluationCount / $totalStudents) * 100, 2) 
                        : 0,
                    'isComplete' => $myEvaluationCount === $totalStudents,
                ],
                'stageStatus' => [
                    'isLocked' => $approval?->isLocked() ?? false,
                    'status' => $approval?->status ?? 'pending',
                    'approvedAt' => $approval?->approved_at?->toISOString(),
                    'publishedAt' => $approval?->published_at?->toISOString(),
                ],
            ],
        ]);
    }
}
