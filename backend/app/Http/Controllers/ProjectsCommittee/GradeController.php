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

        // Only show grades with final_grade calculated
        $query->whereNotNull('final_grade');

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
            // Validate that grade has final_grade calculated
            if (!$grade->final_grade) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot approve grade without final grade calculated',
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
