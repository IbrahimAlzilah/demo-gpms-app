<?php

namespace App\Http\Controllers\ProjectsCommittee;

use App\Http\Controllers\Controller;
use App\Http\Traits\HasTableQuery;
use App\Models\ProjectRegistration;
use App\Services\ProjectService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RegistrationController extends Controller
{
    use HasTableQuery;

    public function __construct(
        protected ProjectService $projectService,
        protected NotificationService $notificationService
    ) {}

    /**
     * List project registrations
     */
    public function index(Request $request): JsonResponse
    {
        $query = ProjectRegistration::with(['project', 'student', 'reviewer']);

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by project if provided
        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        $query = $this->applyTableQuery($query, $request);

        return response()->json($this->getPaginatedResponse($query, $request));
    }

    /**
     * Show a specific registration
     */
    public function show(ProjectRegistration $registration): JsonResponse
    {
        $registration->load(['project', 'student', 'reviewer']);

        return response()->json([
            'success' => true,
            'data' => $registration,
        ]);
    }

    /**
     * Approve a project registration
     */
    public function approve(Request $request, ProjectRegistration $registration): JsonResponse
    {
        $this->authorize('approve', $registration);

        try {
            $validated = $request->validate([
                'comments' => 'nullable|string|max:1000',
            ]);

            $approved = $this->projectService->approveRegistration(
                $registration,
                $request->user()
            );

            // Update review comments if provided
            if (isset($validated['comments'])) {
                $approved->update(['review_comments' => $validated['comments']]);
            }

            // Notify student about approval
            $this->notificationService->create(
                $registration->student,
                "تم قبول طلب تسجيلك في المشروع: {$registration->project->title}",
                'registration_approved',
                'project',
                $registration->project_id
            );

            return response()->json([
                'success' => true,
                'data' => $approved->load(['project', 'student', 'reviewer']),
                'message' => 'Registration approved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Reject a project registration
     */
    public function reject(Request $request, ProjectRegistration $registration): JsonResponse
    {
        $this->authorize('reject', $registration);

        try {
            $validated = $request->validate([
                'comments' => 'required|string|max:1000',
            ]);

            $rejected = $this->projectService->rejectRegistration(
                $registration,
                $request->user(),
                $validated['comments']
            );

            // Notify student about rejection
            $this->notificationService->create(
                $registration->student,
                "تم رفض طلب تسجيلك في المشروع: {$registration->project->title}\nملاحظات: {$validated['comments']}",
                'registration_rejected',
                'project',
                $registration->project_id
            );

            return response()->json([
                'success' => true,
                'data' => $rejected->load(['project', 'student', 'reviewer']),
                'message' => 'Registration rejected',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

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

    protected function applyFilters($query, array $filters)
    {
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (isset($filters['project_id'])) {
            $query->where('project_id', $filters['project_id']);
        }
        return $query;
    }
}
