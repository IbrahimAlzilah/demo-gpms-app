<?php

namespace App\Http\Controllers\ProjectsCommittee;

use App\Http\Controllers\Controller;
use App\Models\DefenseEvaluation;
use App\Models\DefenseApproval;
use App\Models\Project;
use App\Models\User;
use App\Services\DefenseEvaluationService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DefenseEvaluationController extends Controller
{
    public function __construct(
        protected DefenseEvaluationService $evaluationService,
        protected NotificationService $notificationService
    ) {}

    /**
     * Get all projects with defense evaluation status
     * GET /projects-committee/defense-evaluations
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'stage' => 'nullable|in:fd1,fd2',
        ]);

        $stage = $validated['stage'] ?? 'fd1'; // Default to FD1

        $projects = Project::where('status', 'in_progress')
            ->with(['students', 'assignedGroup', 'supervisor', 'committeeMembers'])
            ->withCount('students')
            ->get();

        $data = [];
        foreach ($projects as $project) {
            $stats = $this->evaluationService->getEvaluationStatistics($project, $stage);

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
                    'committeeCount' => $project->committeeMembers->count(),
                ],
                'statistics' => $stats,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Get ALL evaluations for review (full visibility for project committee)
     * GET /projects-committee/defense-evaluations/{project}/review/{stage}
     */
    public function getAllEvaluationsForReview(Request $request, Project $project, string $stage): JsonResponse
    {
        // Validate stage
        if (!in_array($stage, ['fd1', 'fd2'])) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid defense stage. Must be fd1 or fd2.',
            ], 400);
        }

        $students = $project->students;
        $data = [];

        foreach ($students as $student) {
            // Get detailed grade breakdown using the new service method
            $breakdown = $this->evaluationService->getGradeBreakdown($project, $student, $stage);

            $data[] = [
                'student' => [
                    'id' => $student->id,
                    'name' => $student->name ?? '',
                    'email' => $student->email,
                    'studentId' => $student->student_id ?? $student->username,
                ],
                // Detailed breakdown with individual contributions
                'gradeBreakdown' => $breakdown,
                // Legacy format for backward compatibility
                'supervisorEvaluation' => $breakdown['supervisor'],
                'committeeEvaluations' => $breakdown['committeeMembers'],
                'committeeContribution' => $breakdown['committeeContribution'],
                'projectCommitteeEvaluations' => $breakdown['projectCommitteeMembers'],
                'projectCommitteeContribution' => $breakdown['projectCommitteeContribution'],
                'supervisorContribution' => $breakdown['supervisorContribution'],
                'finalGrade' => $breakdown['finalGrade'],
            ];
        }

        // Get approval status
        $approval = DefenseApproval::where('project_id', $project->id)
            ->where('defense_stage', $stage)
            ->first();

        // Get statistics
        $stats = $this->evaluationService->getEvaluationStatistics($project, $stage);

        // Get validation errors (if any)
        $validationErrors = $this->evaluationService->validateEvaluationsForApproval($project, $stage);

        return response()->json([
            'success' => true,
            'data' => [
                'evaluations' => $data,
                'approval' => $approval ? [
                    'status' => $approval->status,
                    'isLocked' => $approval->isLocked(),
                    'approvedBy' => $approval->approver?->name ?? null,
                    'approvedAt' => $approval->approved_at?->toISOString(),
                    'publishedBy' => $approval->publisher?->name ?? null,
                    'publishedAt' => $approval->published_at?->toISOString(),
                    'notes' => $approval->notes,
                ] : null,
                'statistics' => $stats,
                'validationErrors' => $validationErrors,
                'canApprove' => empty($validationErrors) && $stats['isComplete'],
            ],
        ]);
    }

    /**
     * Update an existing evaluation (project committee can modify any)
     * PUT /projects-committee/defense-evaluations/{evaluation}
     */
    public function updateEvaluation(Request $request, int $evaluationId): JsonResponse
    {
        $validated = $request->validate([
            'score' => 'nullable|numeric|min:0|max:100',
            'maxScore' => 'nullable|numeric|min:0',
            'criteria' => 'nullable|array',
            'notes' => 'nullable|string|max:5000',
        ]);

        $committeeUser = $request->user();
        $evaluation = DefenseEvaluation::findOrFail($evaluationId);

        try {
            $updated = $this->evaluationService->updateEvaluation(
                $evaluation,
                $validated,
                $committeeUser
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
     * Add a new evaluation (project committee adjustment)
     * POST /projects-committee/defense-evaluations
     */
    public function addEvaluation(Request $request): JsonResponse
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

        $committeeUser = $request->user();
        $project = Project::findOrFail($validated['project_id']);
        $student = User::findOrFail($validated['student_id']);

        try {
            $evaluation = $this->evaluationService->addProjectCommitteeEvaluation(
                $project,
                $student,
                $validated['stage'],
                [
                    'score' => $validated['score'],
                    'maxScore' => $validated['maxScore'] ?? 100,
                    'criteria' => $validated['criteria'] ?? [],
                    'notes' => $validated['notes'] ?? null,
                ],
                $committeeUser
            );

            return response()->json([
                'success' => true,
                'message' => 'Adjustment evaluation added successfully',
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
     * Delete an evaluation
     * DELETE /projects-committee/defense-evaluations/{evaluation}
     */
    public function deleteEvaluation(Request $request, int $evaluationId): JsonResponse
    {
        $committeeUser = $request->user();
        $evaluation = DefenseEvaluation::findOrFail($evaluationId);

        try {
            $this->evaluationService->deleteEvaluation($evaluation, $committeeUser);

            return response()->json([
                'success' => true,
                'message' => 'Evaluation deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Approve a defense stage
     * POST /projects-committee/defense-approvals/{project}/approve/{stage}
     */
    public function approveStage(Request $request, Project $project, string $stage): JsonResponse
    {
        // Validate stage
        if (!in_array($stage, ['fd1', 'fd2'])) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid defense stage',
            ], 400);
        }

        $validated = $request->validate([
            'notes' => 'nullable|string|max:5000',
            'skipValidation' => 'nullable|boolean', // Allow skipping validation if needed
        ]);

        $approver = $request->user();

        // Validate all required evaluations exist
        if (!($validated['skipValidation'] ?? false)) {
            $validationErrors = $this->evaluationService->validateEvaluationsForApproval($project, $stage);
            if (!empty($validationErrors)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot approve: Missing required evaluations',
                    'errors' => $validationErrors,
                ], 422);
            }
        }

        try {
            $approval = $this->evaluationService->approveStage($project, $stage, $approver);

            // Update notes if provided
            if (isset($validated['notes'])) {
                $approval->notes = $validated['notes'];
                $approval->save();
            }

            // Notify project committee members that stage is ready to publish
            // (In a real system, you'd notify all project committee members)

            return response()->json([
                'success' => true,
                'message' => ucfirst($stage) . ' stage approved successfully. Ready to publish.',
                'data' => [
                    'status' => $approval->status,
                    'approvedBy' => $approver->name ?? 'Unknown',
                    'approvedAt' => $approval->approved_at?->toISOString(),
                    'canPublish' => $approval->canPublish(),
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
     * Publish results to students
     * POST /projects-committee/defense-approvals/{project}/publish/{stage}
     */
    public function publishResults(Request $request, Project $project, string $stage): JsonResponse
    {
        // Validate stage
        if (!in_array($stage, ['fd1', 'fd2'])) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid defense stage',
            ], 400);
        }

        $publisher = $request->user();

        try {
            $approval = $this->evaluationService->publishResults($project, $stage, $publisher);

            // Notify all students in the project (bilingual, once per student, retry-safe)
            $students = $project->students;
            $stageLabel = strtoupper($stage);

            foreach ($students as $student) {
                $grade = \App\Models\Grade::where('project_id', $project->id)
                    ->where('student_id', $student->id)
                    ->first();

                $finalGrade = $stage === 'fd1' ? $grade?->fd1_final_grade : $grade?->fd2_final_grade;
                $gradeText = $finalGrade !== null ? " {$finalGrade}/100" : '';

                $message = [
                    'en' => "Final Defense {$stageLabel} results for project \"{$project->title}\" have been published.{$gradeText}",
                    'ar' => "تم نشر نتائج المناقشة النهائية {$stageLabel} للمشروع: {$project->title}.{$gradeText}",
                ];

                $this->notificationService->create(
                    $student,
                    json_encode($message),
                    'defense_results_published',
                    Project::class,
                    $project->id
                );
            }

            return response()->json([
                'success' => true,
                'message' => ucfirst($stage) . ' results published successfully. Students have been notified.',
                'data' => [
                    'status' => $approval->status,
                    'publishedBy' => $publisher->name ?? 'Unknown',
                    'publishedAt' => $approval->published_at?->toISOString(),
                    'studentsNotified' => $students->count(),
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
     * Get evaluation statistics for a specific project and stage
     * GET /projects-committee/defense-evaluations/{project}/statistics/{stage}
     */
    public function getStatistics(Request $request, Project $project, string $stage): JsonResponse
    {
        // Validate stage
        if (!in_array($stage, ['fd1', 'fd2'])) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid defense stage',
            ], 400);
        }

        $stats = $this->evaluationService->getEvaluationStatistics($project, $stage);

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
