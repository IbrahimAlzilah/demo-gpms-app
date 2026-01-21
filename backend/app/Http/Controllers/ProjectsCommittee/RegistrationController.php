<?php

namespace App\Http\Controllers\ProjectsCommittee;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectRegistrationResource;
use App\Http\Traits\HasTableQuery;
use App\Models\ProjectRegistration;
use App\Models\StudentGroup;
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

        return response()->json($this->getPaginatedResponse($query, $request, ProjectRegistrationResource::class));
    }

    /**
     * List student groups for manual registration
     * Returns leader info and members count for UI selection.
     */
    public function groups(Request $request): JsonResponse
    {
        $query = StudentGroup::query()
            ->with(['leader:id,name,email'])
            ->withCount('members')
            ->orderBy('id', 'desc');

        // Optional: only groups that are eligible (meets min/max members)
        if ($request->boolean('eligible_only', false)) {
            $minMembers = app(\App\Services\SettingsService::class)->getGroupMinMembers();
            $maxMembers = app(\App\Services\SettingsService::class)->getGroupMaxMembers();

            // members_count is members only; total = members_count + 1 (leader)
            $query->havingRaw('(members_count + 1) >= ? AND (members_count + 1) <= ?', [$minMembers, $maxMembers]);
        }

        $groups = $query->get()->map(function (StudentGroup $group) {
            return [
                'id' => (string) $group->id,
                'name' => $group->name,
                'code' => $group->group_code,
                'leader' => [
                    'id' => (string) ($group->leader?->id),
                    'name' => $group->leader?->name,
                    'email' => $group->leader?->email,
                ],
                'members_count' => (int) ($group->members_count + 1), // include leader for UI
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $groups,
        ]);
    }

    /**
     * Show a specific registration
     */
    public function show(ProjectRegistration $registration): JsonResponse
    {
        $registration->load(['project', 'student', 'reviewer']);

        return response()->json([
            'success' => true,
            'data' => new ProjectRegistrationResource($registration),
        ]);
    }

    /**
     * Manually register a student or student group to a project
     * Project Committee can register students/groups without time window restrictions
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'student_group_id' => 'required|exists:student_groups,id',
            'auto_approve' => 'nullable|boolean',
        ]);

        $project = \App\Models\Project::findOrFail($validated['project_id']);
        $studentGroup = \App\Models\StudentGroup::findOrFail($validated['student_group_id']);

        // Validate group meets registration requirements
        if (!$studentGroup->meetsRegistrationRequirements()) {
            $minMembers = app(\App\Services\SettingsService::class)->getGroupMinMembers();
            $maxMembers = app(\App\Services\SettingsService::class)->getGroupMaxMembers();
            $totalMembers = $studentGroup->getTotalMemberCount();
            
            return response()->json([
                'success' => false,
                'message' => "Group must have between {$minMembers} and {$maxMembers} members (current: {$totalMembers})",
            ], 422);
        }

        // Check if project is already assigned to another group
        if ($project->assigned_group_id && $project->assigned_group_id !== $studentGroup->id) {
            return response()->json([
                'success' => false,
                'message' => 'Project is already assigned to another group',
            ], 422);
        }

        try {
            // Get all group members
            $groupMembers = $studentGroup->members()->pluck('users.id')->push($studentGroup->leader_id)->unique();
            
            // Check if any member is already registered in this or another project
            $hasProject = \App\Models\Project::whereHas('students', function ($query) use ($groupMembers) {
                $query->whereIn('users.id', $groupMembers);
            })->exists();

            if ($hasProject) {
                return response()->json([
                    'success' => false,
                    'message' => 'One or more group members are already registered in another project',
                ], 422);
            }

            // Create registration for the group
            $registration = $this->projectService->registerStudentGroup(
                $project,
                $studentGroup,
                $studentGroup->leader // Leader as representative
            );

            // Auto-approve if requested (default behavior for manual registration)
            $autoApprove = $validated['auto_approve'] ?? true;
            if ($autoApprove && $registration->status === 'pending') {
                $registration = $this->projectService->approveRegistration(
                    $registration,
                    $request->user()
                );
            }

            return response()->json([
                'success' => true,
                'data' => new ProjectRegistrationResource($registration->load(['project', 'student', 'reviewer'])),
                'message' => 'Group registered successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
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
                'data' => new ProjectRegistrationResource($approved->load(['project', 'student', 'reviewer'])),
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
                'data' => new ProjectRegistrationResource($rejected->load(['project', 'student', 'reviewer'])),
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
        if (isset($filters['student_id'])) {
            $query->where('student_id', $filters['student_id']);
        }
        return $query;
    }
}
