<?php

namespace App\Http\Controllers\DiscussionCommittee;

use App\Http\Controllers\Controller;
use App\Http\Resources\GradeResource;
use App\Http\Resources\ProjectResource;
use App\Http\Traits\HasTableQuery;
use App\Models\Grade;
use App\Models\Project;
use App\Services\EvaluationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EvaluationController extends Controller
{
    use HasTableQuery;

    public function __construct(
        protected EvaluationService $evaluationService
    ) {}

    /**
     * Get evaluation list (all projects with students) or evaluations for a specific project
     * GET /discussion-committee/evaluations (list all)
     * GET /discussion-committee/evaluations?project_id={id} (specific project)
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        // If project_id is provided, return evaluations for that project only (backward compatibility)
        if ($request->has('project_id') && $request->project_id) {
            $validated = $request->validate([
                'project_id' => 'required|exists:projects,id',
            ]);

            $project = Project::findOrFail($validated['project_id']);

            // Verify user is assigned to this project's committee
            $isAssigned = $project->committeeMembers()->where('users.id', $userId)->exists();

            if (!$isAssigned) {
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

        // Otherwise, return paginated list of all evaluation items (project + student combinations)
        // Get all projects assigned to this committee member
        $projectsQuery = Project::whereHas('committeeMembers', function ($q) use ($userId) {
            $q->where('users.id', $userId);
        })
        ->where('status', 'in_progress')
        ->with(['supervisor', 'students', 'assignedGroup']);

        // Apply search if provided
        if ($request->has('search') && $request->search) {
            $projectsQuery = $this->applySearch($projectsQuery, $request->search);
        }

        // Get paginated projects
        $page = (int) $request->get('page', 1);
        $pageSize = (int) $request->get('pageSize', 10);

        $totalProjects = $projectsQuery->count();
        $totalPages = ceil($totalProjects / $pageSize);

        $projects = $projectsQuery->orderBy('created_at', 'desc')
            ->skip(($page - 1) * $pageSize)
            ->take($pageSize)
            ->get();

        // Build evaluation list items (project + student combinations)
        $items = [];
        foreach ($projects as $project) {
            if ($project->students && $project->students->count() > 0) {
                // Get all grades for this project
                $grades = Grade::where('project_id', $project->id)
                    ->with('student')
                    ->get()
                    ->keyBy('student_id');

                // Check if any grade is approved (locked)
                $isLocked = $grades->some(fn($g) => $g->is_approved);

                foreach ($project->students as $student) {
                    $evaluation = $grades->get($student->id);
                    $items[] = [
                        'project' => [
                            'id' => $project->id,
                            'title' => $project->title,
                            'description' => $project->description,
                            'specialization' => $project->specialization,
                            'status' => $project->status,
                            'supervisor' => $project->supervisor ? [
                                'id' => $project->supervisor->id,
                                'firstName' => $project->supervisor->first_name,
                                'lastName' => $project->supervisor->last_name,
                                'name' => $project->supervisor->first_name . ' ' . $project->supervisor->last_name,
                            ] : null,
                        ],
                        'student' => [
                            'id' => $student->id,
                            'firstName' => $student->first_name,
                            'lastName' => $student->last_name,
                            'name' => $student->first_name . ' ' . $student->last_name,
                            'email' => $student->email,
                            'studentId' => $student->student_id ?? null,
                            'username' => $student->username ?? '',
                            'role' => $student->role,
                            'status' => $student->status ?? 'active',
                        ],
                        'hasEvaluation' => $evaluation !== null && $evaluation->committee_grade !== null,
                        'isLocked' => $isLocked,
                        'evaluation' => $evaluation ? [
                            'id' => $evaluation->id,
                            'score' => $evaluation->committee_grade['score'] ?? null,
                            'maxScore' => $evaluation->committee_grade['maxScore'] ?? null,
                            'supervisorScore' => $evaluation->supervisor_grade['score'] ?? null,
                            'supervisorMaxScore' => $evaluation->supervisor_grade['maxScore'] ?? null,
                            'finalGrade' => $evaluation->final_grade,
                            'isApproved' => $evaluation->is_approved,
                            'comments' => $evaluation->committee_grade['comments'] ?? null,
                        ] : null,
                    ];
                }
            }
        }

        // Calculate total items (all students across all assigned projects)
        $totalItems = Project::whereHas('committeeMembers', function ($q) use ($userId) {
            $q->where('users.id', $userId);
        })
        ->where('status', 'in_progress')
        ->withCount('students')
        ->get()
        ->sum('students_count');

        return response()->json([
            'success' => true,
            'data' => $items,
            'pagination' => [
                'page' => $page,
                'pageSize' => $pageSize,
                'total' => $totalItems,
                'totalPages' => ceil($totalItems / $pageSize),
            ],
        ]);
    }

    /**
     * Get projects assigned to committee member for evaluation (grouped view)
     * GET /discussion-committee/evaluations/projects
     */
    public function projects(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $projects = Project::whereHas('committeeMembers', function ($q) use ($userId) {
            $q->where('users.id', $userId);
        })
        ->where('status', 'in_progress')
        ->with(['supervisor', 'students', 'assignedGroup', 'committeeMembers'])
        ->withCount('students')
        ->orderBy('created_at', 'desc')
        ->get();

        $items = [];
        foreach ($projects as $project) {
            // Get evaluation status
            $grades = Grade::where('project_id', $project->id)->get();
            $hasApprovedGrade = $grades->some(fn($g) => $g->is_approved);
            $evaluatedCount = $grades->filter(fn($g) => $g->committee_grade !== null)->count();
            $totalStudents = $project->students_count;

            // Determine evaluation phase based on chapters submitted
            $phase = 'phase_1'; // Default to Phase 1
            // You could add logic here to determine if this is Phase 1 or 2 based on project documents

            $items[] = [
                'project' => new ProjectResource($project),
                'studentsCount' => $totalStudents,
                'evaluatedCount' => $evaluatedCount,
                'isLocked' => $hasApprovedGrade,
                'evaluationProgress' => $totalStudents > 0
                    ? round(($evaluatedCount / $totalStudents) * 100)
                    : 0,
                'phase' => $phase,
                'committeeMembers' => $project->committeeMembers->map(fn($m) => [
                    'id' => $m->id,
                    'name' => $m->first_name . ' ' . $m->last_name,
                ]),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
    }

    /**
     * Apply search to query
     */
    protected function applySearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%")
                ->orWhere('specialization', 'like', "%{$search}%")
                ->orWhereHas('students', function ($studentQuery) use ($search) {
                    $studentQuery->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
        });
    }

    /**
     * Submit a grade/evaluation for a single student
     * POST /discussion-committee/evaluations
     *
     * Accepts both payload formats:
     * - Backend format: project_id, student_id, score, max_score, criteria, comments
     * - Frontend format: projectId, studentId, grade.score, grade.maxScore, grade.criteria, grade.comments
     */
    public function store(Request $request): JsonResponse
    {
        // Normalize payload - handle both frontend (camelCase + nested grade) and backend (snake_case) formats
        $projectId = $request->input('project_id') ?? $request->input('projectId');
        $studentId = $request->input('student_id') ?? $request->input('studentId');

        // Handle nested grade object from frontend or flat structure
        $gradeData = $request->input('grade');
        $score = $gradeData['score'] ?? $request->input('score');
        $maxScore = $gradeData['maxScore'] ?? $request->input('max_score');
        $criteria = $gradeData['criteria'] ?? $request->input('criteria');
        $comments = $gradeData['comments'] ?? $request->input('comments');

        // Validate normalized data (criteria optional; default to empty array)
        $criteriaNormalized = $criteria;
        if ($criteriaNormalized === null || $criteriaNormalized === '') {
            $criteriaNormalized = [];
        }
        if (is_object($criteriaNormalized)) {
            $criteriaNormalized = (array) $criteriaNormalized;
        }

        $validated = validator([
            'project_id' => $projectId,
            'student_id' => $studentId,
            'score' => $score,
            'max_score' => $maxScore,
            'criteria' => $criteriaNormalized,
            'comments' => $comments,
        ], [
            'project_id' => 'required|exists:projects,id',
            'student_id' => 'required|exists:users,id',
            'score' => 'required|numeric|min:0',
            'max_score' => 'required|numeric|min:0',
            'criteria' => 'nullable|array',
            'comments' => 'nullable|string',
        ])->validate();

        $validated['criteria'] = $validated['criteria'] ?? [];

        $project = Project::findOrFail($validated['project_id']);

        // Verify user is assigned to this project's committee
        $isAssigned = $project->committeeMembers()->where('users.id', $request->user()->id)->exists();

        if (!$isAssigned) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - You are not assigned to this project\'s discussion committee',
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

        // Derive committee members from database assignments (don't trust client)
        $committeeMembers = $project->committeeMembers()
            ->pluck('users.id')
            ->map(fn($id) => (string) $id)
            ->toArray();

        // Ensure requesting user is in the committee (already verified above, but double-check)
        if (!in_array((string) $request->user()->id, $committeeMembers)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - You are not a member of this project\'s discussion committee',
            ], 403);
        }

        // Validate committee has 2-3 members as per requirements
        if (count($committeeMembers) < 2 || count($committeeMembers) > 3) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid committee composition. Committee must have 2-3 members.',
            ], 400);
        }

        try {
            $student = \App\Models\User::findOrFail($validated['student_id']);

            // Check if grade is already approved (prevent updates after approval)
            $existingGrade = Grade::where('project_id', $project->id)
                ->where('student_id', $student->id)
                ->first();

            if ($existingGrade && $existingGrade->is_approved) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot update grade that has already been approved',
                ], 400);
            }

            $grade = $this->evaluationService->submitCommitteeGrade(
                $project,
                $student,
                [
                    'score' => $validated['score'],
                    'maxScore' => $validated['max_score'],
                    'criteria' => $validated['criteria'],
                    'comments' => $validated['comments'] ?? null,
                ],
                $request->user(),
                $committeeMembers // Use derived committee members, not client-provided
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
     * POST /discussion-committee/evaluations/batch
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

        $project = Project::with(['students', 'committeeMembers'])->findOrFail($validated['project_id']);

        // Verify user is assigned to this project's committee
        $isAssigned = $project->committeeMembers()->where('users.id', $request->user()->id)->exists();

        if (!$isAssigned) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - You are not assigned to this project\'s discussion committee',
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

        // Committee members
        $committeeMembers = $project->committeeMembers()
            ->pluck('users.id')
            ->map(fn($id) => (string) $id)
            ->toArray();

        // Determine which students to grade
        $studentIds = $validated['student_ids'] ?? $project->students->pluck('id')->toArray();

        if (empty($studentIds)) {
            return response()->json([
                'success' => false,
                'message' => 'No students found for this project',
            ], 400);
        }

        try {
            $grades = DB::transaction(function () use ($project, $studentIds, $validated, $request, $committeeMembers) {
                $grades = [];
                foreach ($studentIds as $studentId) {
                    $student = \App\Models\User::findOrFail($studentId);
                    $grades[] = $this->evaluationService->submitCommitteeGrade(
                        $project,
                        $student,
                        [
                            'score' => $validated['score'],
                            'maxScore' => $validated['max_score'],
                            'criteria' => $validated['criteria'],
                            'comments' => $validated['comments'] ?? null,
                        ],
                        $request->user(),
                        $committeeMembers
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
     * GET /discussion-committee/evaluations/locked/{project}
     */
    public function isLocked(Request $request, Project $project): JsonResponse
    {
        // Verify user is assigned to this project's committee
        $isAssigned = $project->committeeMembers()->where('users.id', $request->user()->id)->exists();

        if (!$isAssigned) {
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
