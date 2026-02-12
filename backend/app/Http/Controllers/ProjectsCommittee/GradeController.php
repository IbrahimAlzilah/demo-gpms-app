<?php

namespace App\Http\Controllers\ProjectsCommittee;

use App\Http\Controllers\Controller;
use App\Http\Resources\GradeResource;
use App\Http\Traits\HasTableQuery;
use App\Models\Grade;
use App\Services\EvaluationService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GradeController extends Controller
{
    use HasTableQuery;

    public function __construct(
        protected EvaluationService $evaluationService,
        protected NotificationService $notificationService
    ) {}

    /**
     * List grades for approval
     */
    public function index(Request $request): JsonResponse
    {
        $query = Grade::with(['project', 'student', 'approver']);

        // Filter by approval status
        if ($request->has('is_approved')) {
            $isApproved = filter_var($request->is_approved, FILTER_VALIDATE_BOOLEAN);
            $query->where('is_approved', $isApproved);
        } else {
            // Default: show unapproved grades
            $query->where('is_approved', false);
        }

        // Filter by project if provided
        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        // Show grades that have started evaluation (supervisor, committee, or defense stages)
        $query->where(function ($q) {
            $q->whereNotNull('final_grade')
              ->orWhereNotNull('supervisor_grade')
              ->orWhereNotNull('committee_grade')
              ->orWhereNotNull('fd1_final_grade')
              ->orWhereNotNull('fd2_final_grade');
        });

        $query = $this->applyTableQuery($query, $request);

        return response()->json($this->getPaginatedResponse($query, $request, GradeResource::class));
    }

    /**
     * Show a specific grade
     */
    public function show(Grade $grade): JsonResponse
    {
        $this->authorize('view', $grade);

        return response()->json([
            'success' => true,
            'data' => new GradeResource($grade->load(['project', 'student', 'approver'])),
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
                "تم اعتماد درجتك النهائية في المشروع: {$grade->project->title}\nالدرجة النهائية: {$grade->final_grade}",
                'grade_approved',
                'grade',
                $grade->id
            );

            return response()->json([
                'success' => true,
                'data' => new GradeResource($approved->load(['project', 'student', 'approver'])),
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
        ]);

        // Check lock state
        if ($grade->is_approved) {
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

        // Recalculate final if not explicitly set and components changed
        if (!isset($validated['final_grade']) && (isset($validated['supervisor_grade']) || isset($validated['committee_grade']))) {
            $grade->final_grade = $grade->calculateFinalGrade();
        }

        $grade->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Grade updated',
            'data' => new GradeResource($grade->refresh()->load(['project', 'student', 'approver'])),
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
                    "تم إعلان نتيجتك النهائية في المشروع: {$grade->project->title}\nالدرجة النهائية: {$grade->final_grade}",
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
