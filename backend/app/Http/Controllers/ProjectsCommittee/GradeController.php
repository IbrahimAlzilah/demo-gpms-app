<?php

namespace App\Http\Controllers\ProjectsCommittee;

use App\Http\Controllers\Controller;
use App\Http\Resources\GradeResource;
use App\Http\Traits\HasTableQuery;
use App\Models\Grade;
use App\Models\Project;
use App\Models\User;
use App\Services\DefenseEvaluationService;
use App\Services\EvaluationService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GradeController extends Controller
{
    use HasTableQuery;

    public function __construct(
        protected EvaluationService $evaluationService,
        protected DefenseEvaluationService $defenseEvaluationService,
        protected NotificationService $notificationService
    ) {}

    /**
     * List grades for approval.
     * Ensures all students in projects with committee assignment have grade records.
     */
    public function index(Request $request): JsonResponse
    {
        // Ensure grade records exist for all students in projects with committee assigned
        $this->ensureGradesExistForCommitteeProjects();

        $query = Grade::with(['project' => fn ($q) => $q->with(['committeeMembers', 'supervisor', 'students']), 'student', 'approver']);

        // Filter by approval status only when explicitly requested (omit for "All")
        if ($request->has('is_approved')) {
            $isApproved = filter_var($request->is_approved, FILTER_VALIDATE_BOOLEAN);
            $query->where(function ($q) use ($isApproved) {
                $q->where('is_approved', $isApproved)
                  ->orWhere('fd1_approved', $isApproved)
                  ->orWhere('fd2_approved', $isApproved);
            });
        }

        // Filter by project if provided
        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        // Include all grades for projects with committee assigned (even if no evaluations yet)
        $query->whereHas('project', function ($q) {
            $q->whereNotNull('discussion_committee_id')
              ->whereHas('students');
        });

        $query = $this->applyTableQuery($query, $request);

        return response()->json($this->getPaginatedResponse($query, $request, GradeResource::class));
    }

    /**
     * Ensure Grade records exist for every student in every project with committee assigned.
     */
    protected function ensureGradesExistForCommitteeProjects(): void
    {
        $projectIds = Project::whereNotNull('discussion_committee_id')
            ->whereHas('students')
            ->pluck('id');

        foreach ($projectIds as $projectId) {
            $project = Project::with('students')->find($projectId);
            if (!$project || $project->students->isEmpty()) {
                continue;
            }
            foreach ($project->students as $student) {
                Grade::firstOrCreate(
                    [
                        'project_id' => $projectId,
                        'student_id' => $student->id,
                    ],
                    [
                        'is_approved' => false,
                    ]
                );
            }
        }
    }

    /**
     * Show a specific grade
     */
    public function show(Grade $grade): JsonResponse
    {
        $this->authorize('view', $grade);

        return response()->json([
            'success' => true,
            'data' => new GradeResource($grade->load(['project' => fn ($q) => $q->with(['committeeMembers', 'supervisor', 'students']), 'student', 'approver'])),
        ]);
    }

    /**
     * Approve a final grade
     */
    public function approve(Request $request, Grade $grade): JsonResponse
    {
        $this->authorize('approve', $grade);

        try {
            // Validate using model logic
            if (!$grade->isReadyForApproval()) {
                $errors = $grade->getApprovalValidationErrors();
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot approve grade: ' . implode(', ', $errors),
                    'errors' => $errors,
                ], 400);
            }

            // Check if already approved
            if ($grade->is_approved) {
                return response()->json([
                    'success' => false,
                    'message' => 'Grade is already approved',
                ], 400);
            }

            $approved = $this->evaluationService->approveGrade(
                $grade,
                $request->user()
            );

            // Notify student about grade approval
            $this->notificationService->create(
                $grade->student,
                json_encode([
                    'key' => 'notifications.grade.approved',
                    'params' => [
                        'project_title' => $grade->project->title,
                        'final_grade' => $grade->final_grade
                    ]
                ]),
                'grade_approved',
                'grade',
                $grade->id
            );

            return response()->json([
                'success' => true,
                'data' => new GradeResource($approved->load(['project' => fn ($q) => $q->with(['committeeMembers', 'supervisor', 'students']), 'student', 'approver'])),
                'message' => 'Grade approved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Update a grade (Supervisors/Committee scores)
     */
    public function update(Request $request, Grade $grade): JsonResponse
    {
        $this->authorize('update', $grade);

        // Validate
        $validated = $request->validate([
            'supervisor_grade' => 'nullable|array',
            'supervisor_grade.score' => 'nullable|numeric|min:0|max:100',
            'committee_grade' => 'nullable|array',
            'committee_grade.score' => 'nullable|numeric|min:0|max:100',
            'final_grade' => 'nullable|numeric|min:0|max:100',
            'fd1_final_grade' => 'nullable|numeric|min:0|max:100',
            'fd2_final_grade' => 'nullable|numeric|min:0|max:100',
            'fd1_adjustment' => 'nullable|numeric|min:-100|max:100',
            'fd2_adjustment' => 'nullable|numeric|min:-100|max:100',
        ]);

        // Check lock state for legacy approval (fd1/fd2 use DefenseApproval)
        if ($grade->is_approved && !isset($validated['fd1_adjustment']) && !isset($validated['fd2_adjustment'])) {
             return response()->json(['message' => 'Cannot update approved grade'], 400);
        }

        // Merge updates
        if (isset($validated['supervisor_grade'])) {
            $current = $grade->supervisor_grade ?? [];
            $grade->supervisor_grade = array_merge($current, $validated['supervisor_grade']);
        }
        if (isset($validated['committee_grade'])) {
            $current = $grade->committee_grade ?? [];
            $grade->committee_grade = array_merge($current, $validated['committee_grade']);
        }
        if (isset($validated['final_grade'])) {
            $grade->final_grade = $validated['final_grade'];
        }
        if (isset($validated['fd1_final_grade'])) {
            if ($grade->fd1_approved || $grade->fd1_published) {
                return response()->json(['message' => 'Cannot update approved/published FD1 grade'], 400);
            }
            $grade->fd1_final_grade = $validated['fd1_final_grade'];
        }
        if (isset($validated['fd2_final_grade'])) {
             if ($grade->fd2_approved || $grade->fd2_published) {
                return response()->json(['message' => 'Cannot update approved/published FD2 grade'], 400);
            }
            $grade->fd2_final_grade = $validated['fd2_final_grade'];
        }
        if (array_key_exists('fd1_adjustment', $validated)) {
            $grade->fd1_adjustment = $validated['fd1_adjustment'];
        }
        if (array_key_exists('fd2_adjustment', $validated)) {
            $grade->fd2_adjustment = $validated['fd2_adjustment'];
        }

        $grade->save();

        // Recalculate FD1/FD2 final grade when adjustment changes
        if (array_key_exists('fd1_adjustment', $validated) || array_key_exists('fd2_adjustment', $validated)) {
            $project = Project::find($grade->project_id);
            $student = User::find($grade->student_id);
            if ($project && $student) {
                if (array_key_exists('fd1_adjustment', $validated)) {
                    $grade->fd1_final_grade = $this->defenseEvaluationService->calculateStudentFinalGrade($project, $student, 'fd1');
                }
                if (array_key_exists('fd2_adjustment', $validated)) {
                    $grade->fd2_final_grade = $this->defenseEvaluationService->calculateStudentFinalGrade($project, $student, 'fd2');
                }
                $grade->save();
            }
        }

        // Recalculate final if not explicitly set and components changed (legacy flow)
        if (!isset($validated['final_grade']) && (isset($validated['supervisor_grade']) || isset($validated['committee_grade']))) {
            $grade->final_grade = $grade->calculateFinalGrade();
            $grade->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Grade updated',
            'data' => new GradeResource($grade->refresh()->load(['project' => fn ($q) => $q->with(['committeeMembers', 'supervisor', 'students']), 'student', 'approver'])),
        ]);
    }

    /**
     * Publish/announce approved grades to students
     */
    public function publish(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'grade_ids' => 'required|array|min:1',
            'grade_ids.*' => 'exists:grades,id',
        ]);

        try {
            $grades = Grade::whereIn('id', $validated['grade_ids'])
                ->where('is_approved', true)
                ->with(['student', 'project'])
                ->get();

            if ($grades->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No approved grades found to publish',
                ], 400);
            }

            $publishedCount = 0;
            foreach ($grades as $grade) {
                // Send notification to student
                $this->notificationService->create(
                    $grade->student,
                    json_encode([
                        'key' => 'notifications.grade.published',
                        'params' => [
                            'project_title' => $grade->project->title,
                            'final_grade' => $grade->final_grade
                        ]
                    ]),
                    'grade_published',
                    'grade',
                    $grade->id
                );
                $publishedCount++;
            }

            return response()->json([
                'success' => true,
                'message' => "تم إعلان {$publishedCount} درجة بنجاح",
                'data' => [
                    'publishedCount' => $publishedCount,
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
     * Apply search to query
     */
    protected function applySearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->whereHas('student', function ($studentQuery) use ($search) {
                $studentQuery->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->orWhereHas('project', function ($projectQuery) use ($search) {
                $projectQuery->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        });
    }

    /**
     * Apply filters to query
     */
    protected function applyFilters($query, array $filters)
    {
        if (isset($filters['is_approved'])) {
            $isApproved = filter_var($filters['is_approved'], FILTER_VALIDATE_BOOLEAN);
            $query->where('is_approved', $isApproved);
        }
        if (isset($filters['project_id'])) {
            $query->where('project_id', $filters['project_id']);
        }
        return $query;
    }
}
