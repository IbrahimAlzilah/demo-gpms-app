<?php

namespace App\Http\Controllers\Supervisor;

use App\Http\Controllers\Controller;
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
     * Get list of supervisor's projects with FD1/FD2 evaluation status
     * GET /supervisor/defense-evaluations
     */
    public function index(Request $request): JsonResponse
    {
        $supervisor = $request->user();

        $projects = Project::where('supervisor_id', $supervisor->id)
            ->where('status', 'in_progress')
            ->with(['students', 'assignedGroup'])
            ->withCount('students')
            ->get();

        $data = [];
        foreach ($projects as $project) {
            // Get FD1 statistics
            $fd1Stats = $this->evaluationService->getEvaluationStatistics($project, 'fd1');
            
            // Get FD2 statistics
            $fd2Stats = $this->evaluationService->getEvaluationStatistics($project, 'fd2');

            $data[] = [
                'project' => [
                    'id' => $project->id,
                    'title' => $project->title,
                    'description' => $project->description,
                    'specialization' => $project->specialization,
                    'studentsCount' => $project->students_count,
                ],
                'fd1' => $fd1Stats,
                'fd2' => $fd2Stats,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Get evaluations for a specific project and stage
     * GET /supervisor/defense-evaluations/{project}/stage/{stage}
     */
    public function getEvaluations(Request $request, Project $project, string $stage): JsonResponse
    {
        $supervisor = $request->user();

        // Verify ownership
        if ($project->supervisor_id !== $supervisor->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        // Validate stage
        if (!in_array($stage, ['fd1', 'fd2'])) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid defense stage. Must be fd1 or fd2.',
            ], 400);
        }

        // Get students and their evaluations
        $students = $project->students;
        $data = [];

        foreach ($students as $student) {
            $evaluation = $this->evaluationService->getCommitteeMemberEvaluation(
                $project,
                $student,
                $supervisor, // Using supervisor as evaluator
                $stage
            );

            // Note: This gets supervisor's own evaluation, not committee's
            $supervisorEval = \App\Models\DefenseEvaluation::where('project_id', $project->id)
                ->where('student_id', $student->id)
                ->where('evaluator_id', $supervisor->id)
                ->where('defense_stage', $stage)
                ->first();

            $data[] = [
                'student' => [
                    'id' => $student->id,
                    'name' => $student->name ?? '',
                    'email' => $student->email,
                    'studentId' => $student->student_id ?? $student->username,
                ],
                'evaluation' => $supervisorEval ? [
                    'id' => $supervisorEval->id,
                    'score' => $supervisorEval->score,
                    'maxScore' => $supervisorEval->max_score,
                    'normalizedScore' => $supervisorEval->normalized_score,
                    'criteria' => $supervisorEval->criteria,
                    'notes' => $supervisorEval->notes,
                    'createdAt' => $supervisorEval->created_at?->toISOString(),
                    'updatedAt' => $supervisorEval->updated_at?->toISOString(),
                ] : null,
            ];
        }

        // Get statistics
        $stats = $this->evaluationService->getEvaluationStatistics($project, $stage);

        return response()->json([
            'success' => true,
            'data' => [
                'evaluations' => $data,
                'statistics' => $stats,
            ],
        ]);
    }

    /**
     * Submit or update supervisor evaluation
     * POST /supervisor/defense-evaluations
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

        $supervisor = $request->user();
        $project = Project::findOrFail($validated['project_id']);
        $student = User::findOrFail($validated['student_id']);

        try {
            $evaluation = $this->evaluationService->submitSupervisorEvaluation(
                $project,
                $student,
                $validated['stage'],
                [
                    'score' => $validated['score'],
                    'maxScore' => $validated['maxScore'] ?? 100,
                    'criteria' => $validated['criteria'] ?? [],
                    'notes' => $validated['notes'] ?? null,
                ],
                $supervisor
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
     * Update existing evaluation
     * PUT /supervisor/defense-evaluations/{evaluation}
     */
    public function updateEvaluation(Request $request, int $evaluationId): JsonResponse
    {
        $validated = $request->validate([
            'score' => 'nullable|numeric|min:0|max:100',
            'maxScore' => 'nullable|numeric|min:0',
            'criteria' => 'nullable|array',
            'notes' => 'nullable|string|max:5000',
        ]);

        $supervisor = $request->user();
        $evaluation = \App\Models\DefenseEvaluation::findOrFail($evaluationId);

        try {
            $updated = $this->evaluationService->updateEvaluation(
                $evaluation,
                $validated,
                $supervisor
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
     * Check if a project/stage is locked
     * GET /supervisor/defense-evaluations/{project}/locked/{stage}
     */
    public function isLocked(Request $request, Project $project, string $stage): JsonResponse
    {
        $supervisor = $request->user();

        // Verify ownership
        if ($project->supervisor_id !== $supervisor->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        // Validate stage
        if (!in_array($stage, ['fd1', 'fd2'])) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid defense stage',
            ], 400);
        }

        $approval = \App\Models\DefenseApproval::where('project_id', $project->id)
            ->where('defense_stage', $stage)
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'isLocked' => $approval?->isLocked() ?? false,
                'status' => $approval?->status ?? 'pending',
                'approvedAt' => $approval?->approved_at?->toISOString(),
                'publishedAt' => $approval?->published_at?->toISOString(),
            ],
        ]);
    }
}
