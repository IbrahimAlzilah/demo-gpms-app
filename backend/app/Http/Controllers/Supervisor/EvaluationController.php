<?php

namespace App\Http\Controllers\Supervisor;

use App\Http\Controllers\Controller;
use App\Http\Resources\GradeResource;
use App\Http\Resources\ProjectResource;
use App\Models\Grade;
use App\Models\Project;
use App\Services\EvaluationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EvaluationController extends Controller
{
    public function __construct(
        protected EvaluationService $evaluationService
    ) {}

    /**
     * Get evaluations/grades for a project or list of projects assigned to supervisor
     * GET /supervisor/evaluations?project_id={id} (specific project)
     * GET /supervisor/evaluations (all supervisor's projects with evaluation status)
     */
    public function index(Request $request): JsonResponse
    {
        $supervisor = $request->user();

        // If project_id is provided, return grades for that project
        if ($request->has('project_id') && $request->project_id) {
            $validated = $request->validate([
                'project_id' => 'required|exists:projects,id',
            ]);

            $project = Project::findOrFail($validated['project_id']);

            if ($project->supervisor_id !== $supervisor->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            $grades = Grade::where('project_id', $project->id)
                ->with(['student', 'project'])
                ->get();

            return response()->json([
                'success' => true,
                'data' => GradeResource::collection($grades),
            ]);
        }

        // Return all projects assigned to supervisor with evaluation status
        $projects = Project::where('supervisor_id', $supervisor->id)
            ->where('status', 'in_progress')
            ->with(['students', 'assignedGroup'])
            ->withCount('students')
            ->get();

        $items = [];
        foreach ($projects as $project) {
            // Check if any grades are approved (locked)
            $hasApprovedGrade = Grade::where('project_id', $project->id)
                ->where('is_approved', true)
                ->exists();

            // Get evaluation status for each student
            $grades = Grade::where('project_id', $project->id)
                ->with('student')
                ->get()
                ->keyBy('student_id');

            $studentCount = $project->students->count();
            $evaluatedCount = $grades->filter(fn($g) => $g->supervisor_grade !== null)->count();

            $items[] = [
                'project' => new ProjectResource($project),
                'studentsCount' => $studentCount,
                'evaluatedCount' => $evaluatedCount,
                'isLocked' => $hasApprovedGrade,
                'evaluationProgress' => $studentCount > 0 
                    ? round(($evaluatedCount / $studentCount) * 100) 
                    : 0,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
    }

    /**
     * Submit a grade/evaluation for a single student
     * POST /supervisor/evaluations (with project_id, student_id in body)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'student_id' => 'required|exists:users,id',
            'score' => 'required|numeric|min:0',
            'max_score' => 'required|numeric|min:0',
            'criteria' => 'nullable|array',
            'comments' => 'nullable|string',
        ]);

        $validated['criteria'] = $validated['criteria'] ?? [];

        $project = Project::findOrFail($validated['project_id']);

        if ($project->supervisor_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        // Grade locking: once any grade is approved by Projects Committee, no further edits
        $hasApprovedGrade = Grade::where('project_id', $project->id)->where('is_approved', true)->exists();
        if ($hasApprovedGrade) {
            return response()->json([
                'success' => false,
                'message' => 'Evaluations are locked; grades have been approved by the Projects Committee.',
            ], 403);
        }

        try {
            $student = \App\Models\User::findOrFail($validated['student_id']);
            $grade = $this->evaluationService->submitSupervisorGrade(
                $project,
                $student,
                [
                    'score' => $validated['score'],
                    'maxScore' => $validated['max_score'],
                    'criteria' => $validated['criteria'],
                    'comments' => $validated['comments'] ?? null,
                ],
                $request->user()
            );

            return response()->json([
                'success' => true,
                'data' => new GradeResource($grade->load(['project', 'student'])),
                'message' => 'Grade submitted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Submit grades for all students in a project at once (group evaluation)
     * POST /supervisor/evaluations/batch
     */
    public function batchStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'score' => 'required|numeric|min:0',
            'max_score' => 'required|numeric|min:0',
            'criteria' => 'nullable|array',
            'comments' => 'nullable|string',
            'student_ids' => 'nullable|array',
            'student_ids.*' => 'exists:users,id',
        ]);

        $validated['criteria'] = $validated['criteria'] ?? [];

        $project = Project::with('students')->findOrFail($validated['project_id']);

        if ($project->supervisor_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        // Grade locking check
        $hasApprovedGrade = Grade::where('project_id', $project->id)->where('is_approved', true)->exists();
        if ($hasApprovedGrade) {
            return response()->json([
                'success' => false,
                'message' => 'Evaluations are locked; grades have been approved by the Projects Committee.',
            ], 403);
        }

        // Determine which students to grade
        $studentIds = $validated['student_ids'] ?? $project->students->pluck('id')->toArray();

        if (empty($studentIds)) {
            return response()->json([
                'success' => false,
                'message' => 'No students found for this project',
            ], 400);
        }

        try {
            $grades = DB::transaction(function () use ($project, $studentIds, $validated, $request) {
                $grades = [];
                foreach ($studentIds as $studentId) {
                    $student = \App\Models\User::findOrFail($studentId);
                    $grades[] = $this->evaluationService->submitSupervisorGrade(
                        $project,
                        $student,
                        [
                            'score' => $validated['score'],
                            'maxScore' => $validated['max_score'],
                            'criteria' => $validated['criteria'],
                            'comments' => $validated['comments'] ?? null,
                        ],
                        $request->user()
                    );
                }
                return $grades;
            });

            return response()->json([
                'success' => true,
                'data' => GradeResource::collection(collect($grades)->map->load(['project', 'student'])),
                'message' => count($grades) . ' grade(s) submitted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Check if evaluation is locked for a project
     * GET /supervisor/evaluations/locked/{project}
     */
    public function isLocked(Request $request, Project $project): JsonResponse
    {
        if ($project->supervisor_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $hasApprovedGrade = Grade::where('project_id', $project->id)
            ->where('is_approved', true)
            ->exists();

        return response()->json([
            'success' => true,
            'data' => [
                'isLocked' => $hasApprovedGrade,
            ],
        ]);
    }
}
