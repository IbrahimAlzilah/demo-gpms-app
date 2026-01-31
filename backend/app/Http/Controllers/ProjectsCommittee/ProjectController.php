<?php

namespace App\Http\Controllers\ProjectsCommittee;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Http\Traits\HasTableQuery;
use App\Models\Project;
use App\Models\User;
use App\Services\ProjectService;
use App\Services\NotificationService;
use App\Enums\ProjectStatus;
use App\Enums\ProposalStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    use HasTableQuery;

    public function __construct(
        protected ProjectService $projectService,
        protected NotificationService $notificationService
    ) {}

    /**
     * Get all projects with comprehensive filtering and statistics
     */
    public function index(Request $request): JsonResponse
    {
        $query = Project::with(['supervisor', 'students', 'assignedGroup.leader', 'assignedGroup.members']);

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);

            // For draft status, only show projects from approved proposals
            if ($request->status === ProjectStatus::DRAFT->value) {
                $query->whereHas('proposals', function ($q) {
                    $q->where('status', ProposalStatus::APPROVED->value);
                });
            }
        }

        // Filter projects without supervisor
        if ($request->has('supervisor_id') && $request->supervisor_id === 'null') {
            $query->whereNull('supervisor_id');
        }

        $query = $this->applyTableQuery($query, $request);

        return response()->json($this->getPaginatedResponse($query, $request, ProjectResource::class));
    }

    /**
     * Get detailed project information with all related data
     */
    public function show(Project $project): JsonResponse
    {
        $project->load([
            'supervisor',
            'students',
            'assignedGroup.leader',
            'assignedGroup.members',
            'documents.submitter',
            'grades.student',
            'milestones',
            'meetings',
            'supervisorNotes.supervisor',
            'committeeMembers',
            'registrations.student',
            'proposals',
            'requests.student',
        ]);

        // Calculate project statistics
        $statistics = [
            'documentsCount' => $project->documents->count(),
            'documentsByStatus' => [
                'pending' => $project->documents->where('review_status', 'pending')->count(),
                'approved' => $project->documents->where('review_status', 'approved')->count(),
                'rejected' => $project->documents->where('review_status', 'rejected')->count(),
            ],
            'gradesCount' => $project->grades->count(),
            'approvedGrades' => $project->grades->where('is_approved', true)->count(),
            'milestonesCount' => $project->milestones->count(),
            'completedMilestones' => $project->milestones->where('is_completed', true)->count(),
            'meetingsCount' => $project->meetings->count(),
            'notesCount' => $project->supervisorNotes->count(),
            'requestsCount' => $project->requests->count(),
            'pendingRequests' => $project->requests->where('status', 'pending')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => new ProjectResource($project),
            'statistics' => $statistics,
        ]);
    }

    /**
     * Update project details
     */
    public function update(Request $request, Project $project): JsonResponse
    {
        $settingsService = app(\App\Services\SettingsService::class);
        $proposalTitleMaxLength = $settingsService->getProposalTitleMaxLength();
        $projectMaxStudentsLimit = $settingsService->getProjectMaxStudentsLimit();
        $projectKeywordMaxLength = $settingsService->getProjectKeywordMaxLength();

        $validated = $request->validate([
            'title' => "sometimes|string|max:{$proposalTitleMaxLength}",
            'description' => 'sometimes|string',
            'max_students' => "sometimes|integer|min:1|max:{$projectMaxStudentsLimit}",
            'specialization' => "sometimes|nullable|string|max:{$proposalTitleMaxLength}",
            'keywords' => 'sometimes|nullable|array',
            'keywords.*' => "string|max:{$projectKeywordMaxLength}",
            'supervisor_id' => 'sometimes|nullable|exists:users,id',
        ]);

        try {
            $project->update($validated);

            // Notify supervisor if changed
            if (isset($validated['supervisor_id']) && $validated['supervisor_id'] !== $project->getOriginal('supervisor_id')) {
                if ($validated['supervisor_id']) {
                    $this->notificationService->create(
                        User::find($validated['supervisor_id']),
                        "تم تعيينك كمشرف على المشروع: {$project->title}",
                        'supervisor_assigned',
                        'project',
                        $project->id
                    );
                }
            }

            return response()->json([
                'success' => true,
                'data' => new ProjectResource($project->fresh(['supervisor', 'students', 'assignedGroup'])),
                'message' => 'تم تحديث المشروع بنجاح',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Update project status
     */
    public function updateStatus(Request $request, Project $project): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:draft,announced,available_for_registration,in_progress,completed,archived',
            'notify_students' => 'sometimes|boolean',
        ]);

        try {
            $oldStatus = $project->status->value;
            $newStatus = $validated['status'];

            $project->update(['status' => $newStatus]);

            // Notify relevant parties if requested
            if ($validated['notify_students'] ?? true) {
                $this->notifyStatusChange($project, $oldStatus, $newStatus);
            }

            return response()->json([
                'success' => true,
                'data' => new ProjectResource($project->fresh(['supervisor', 'students'])),
                'message' => 'تم تحديث حالة المشروع بنجاح',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get project workflow overview with all phases
     */
    public function workflow(Project $project): JsonResponse
    {
        $project->load([
            'supervisor',
            'students',
            'assignedGroup.leader',
            'documents',
            'grades',
            'milestones',
            'meetings',
            'supervisorNotes',
            'committeeMembers',
            'registrations',
        ]);

        // Build workflow phases
        $phases = [
            [
                'name' => 'proposal',
                'title' => 'مرحلة المقترح',
                'status' => $this->getProposalPhaseStatus($project),
                'details' => [
                    'proposalsCount' => $project->proposals->count(),
                    'approvedProposals' => $project->proposals->where('status', 'approved')->count(),
                ],
            ],
            [
                'name' => 'registration',
                'title' => 'مرحلة التسجيل',
                'status' => $this->getRegistrationPhaseStatus($project),
                'details' => [
                    'registrationsCount' => $project->registrations->count(),
                    'hasAssignedGroup' => $project->assigned_group_id !== null,
                    'studentsCount' => $project->students->count(),
                ],
            ],
            [
                'name' => 'supervision',
                'title' => 'مرحلة الإشراف',
                'status' => $this->getSupervisionPhaseStatus($project),
                'details' => [
                    'hasSupervisor' => $project->supervisor_id !== null,
                    'supervisorName' => $project->supervisor?->name,
                    'notesCount' => $project->supervisorNotes->count(),
                    'meetingsCount' => $project->meetings->count(),
                ],
            ],
            [
                'name' => 'documents',
                'title' => 'مرحلة التسليمات',
                'status' => $this->getDocumentsPhaseStatus($project),
                'details' => [
                    'totalDocuments' => $project->documents->count(),
                    'approvedDocuments' => $project->documents->where('review_status', 'approved')->count(),
                    'pendingDocuments' => $project->documents->where('review_status', 'pending')->count(),
                ],
            ],
            [
                'name' => 'milestones',
                'title' => 'المراحل والأهداف',
                'status' => $this->getMilestonesPhaseStatus($project),
                'details' => [
                    'totalMilestones' => $project->milestones->count(),
                    'completedMilestones' => $project->milestones->where('is_completed', true)->count(),
                    'overdueMilestones' => $project->milestones
                        ->where('is_completed', false)
                        ->where('due_date', '<', now())
                        ->count(),
                ],
            ],
            [
                'name' => 'evaluation',
                'title' => 'مرحلة التقييم',
                'status' => $this->getEvaluationPhaseStatus($project),
                'details' => [
                    'hasCommittee' => $project->committeeMembers->count() > 0,
                    'committeeCount' => $project->committeeMembers->count(),
                    'gradesSubmitted' => $project->grades->count(),
                    'gradesApproved' => $project->grades->where('is_approved', true)->count(),
                ],
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'project' => new ProjectResource($project),
                'phases' => $phases,
                'overallProgress' => $this->calculateOverallProgress($project),
            ],
        ]);
    }

    /**
     * Get comprehensive project statistics
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total' => Project::count(),
            'byStatus' => [
                'draft' => Project::where('status', ProjectStatus::DRAFT->value)->count(),
                'available_for_registration' => Project::where('status', ProjectStatus::AVAILABLE_FOR_REGISTRATION->value)->count(),
                'in_progress' => Project::where('status', ProjectStatus::IN_PROGRESS->value)->count(),
                'completed' => Project::where('status', ProjectStatus::COMPLETED->value)->count(),
                'archived' => Project::where('status', ProjectStatus::ARCHIVED->value)->count(),
            ],
            'withSupervisor' => Project::whereNotNull('supervisor_id')->count(),
            'withoutSupervisor' => Project::whereNull('supervisor_id')->count(),
            'withGroup' => Project::whereNotNull('assigned_group_id')->count(),
            'recentActivity' => [
                'newThisWeek' => Project::where('created_at', '>=', now()->subWeek())->count(),
                'updatedThisWeek' => Project::where('updated_at', '>=', now()->subWeek())->count(),
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    public function announce(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_ids' => 'required|array',
            'project_ids.*' => 'exists:projects,id',
        ]);

        try {
            $projectIds = $validated['project_ids'];
            $projects = Project::whereIn('id', $projectIds)
                ->where('status', ProjectStatus::DRAFT->value)
                ->whereHas('proposals', function ($q) {
                    $q->where('status', ProposalStatus::APPROVED->value);
                })
                ->get();

            foreach ($projects as $project) {
                $project->update(['status' => ProjectStatus::AVAILABLE_FOR_REGISTRATION->value]);
            }

            // Only get projects that were actually updated (have approved proposals)
            $announcedProjectIds = $projects->pluck('id')->toArray();
            $announcedProjects = Project::whereIn('id', $announcedProjectIds)
                ->with(['supervisor', 'students'])
                ->get();

            // Notify all students about announced projects
            $students = User::where('role', 'student')
                ->where('status', 'active')
                ->pluck('id')
                ->toArray();

            if (!empty($students) && !empty($announcedProjects)) {
                $projectTitles = $announcedProjects->pluck('title')->implode(', ');
                $message = "تم إعلان مشاريع جديدة متاحة للتسجيل: {$projectTitles}";

                $this->notificationService->createForUsers(
                    $students,
                    $message,
                    'projects_announced',
                    'project',
                    null
                );
            }

            return response()->json([
                'success' => true,
                'data' => ProjectResource::collection($announcedProjects),
                'message' => 'Projects announced successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function unannounce(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_ids' => 'required|array',
            'project_ids.*' => 'exists:projects,id',
        ]);

        try {
            $projectIds = $validated['project_ids'];
            $projects = Project::whereIn('id', $projectIds)
                ->where('status', ProjectStatus::AVAILABLE_FOR_REGISTRATION->value)
                ->get();

            foreach ($projects as $project) {
                $project->update(['status' => ProjectStatus::DRAFT->value]);
            }

            // Get projects that were actually updated
            $unannouncedProjectIds = $projects->pluck('id')->toArray();
            $unannouncedProjects = Project::whereIn('id', $unannouncedProjectIds)
                ->with(['supervisor', 'students'])
                ->get();

            // Notify all students about unannounced projects
            $students = User::where('role', 'student')
                ->where('status', 'active')
                ->pluck('id')
                ->toArray();

            if (!empty($students) && !empty($unannouncedProjects)) {
                $projectTitles = $unannouncedProjects->pluck('title')->implode(', ');
                $message = "تم إلغاء إعلان المشاريع التالية: {$projectTitles}";

                $this->notificationService->createForUsers(
                    $students,
                    $message,
                    'projects_unannounced',
                    'project',
                    null
                );
            }

            return response()->json([
                'success' => true,
                'data' => ProjectResource::collection($unannouncedProjects),
                'message' => 'Projects unannounced successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Delete a project (only if not in progress or completed)
     */
    public function destroy(Project $project): JsonResponse
    {
        // Prevent deletion of active projects
        if (in_array($project->status->value, [ProjectStatus::IN_PROGRESS->value, ProjectStatus::COMPLETED->value])) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن حذف مشروع قيد التنفيذ أو مكتمل',
            ], 400);
        }

        try {
            // Notify supervisor and students before deletion
            if ($project->supervisor) {
                $this->notificationService->create(
                    $project->supervisor,
                    "تم حذف المشروع: {$project->title}",
                    'project_deleted',
                    'project',
                    null
                );
            }

            foreach ($project->students as $student) {
                $this->notificationService->create(
                    $student,
                    "تم حذف المشروع: {$project->title}",
                    'project_deleted',
                    'project',
                    null
                );
            }

            $project->delete();

            return response()->json([
                'success' => true,
                'message' => 'تم حذف المشروع بنجاح',
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
            $q->where('title', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%")
                ->orWhereHas('supervisor', function ($sq) use ($search) {
                    $sq->where('name', 'like', "%{$search}%");
                })
                ->orWhereHas('assignedGroup', function ($gq) use ($search) {
                    $gq->whereHas('leader', function ($lq) use ($search) {
                        $lq->where('name', 'like', "%{$search}%");
                    });
                });
        });
    }

    protected function applyFilters($query, array $filters)
    {
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);

            // For draft status, only show projects from approved proposals
            if ($filters['status'] === ProjectStatus::DRAFT->value) {
                $query->whereHas('proposals', function ($q) {
                    $q->where('status', ProposalStatus::APPROVED->value);
                });
            }
        }
        if (isset($filters['supervisor_id'])) {
            if ($filters['supervisor_id'] === 'null') {
                $query->whereNull('supervisor_id');
            } else {
                $query->where('supervisor_id', $filters['supervisor_id']);
            }
        }
        if (isset($filters['has_group'])) {
            if ($filters['has_group'] === 'true') {
                $query->whereNotNull('assigned_group_id');
            } else {
                $query->whereNull('assigned_group_id');
            }
        }
        return $query;
    }

    /**
     * Notify relevant parties about status change
     */
    protected function notifyStatusChange(Project $project, string $oldStatus, string $newStatus): void
    {
        $statusLabels = [
            'draft' => 'مسودة',
            'available_for_registration' => 'متاح للتسجيل',
            'in_progress' => 'قيد التنفيذ',
            'completed' => 'مكتمل',
            'archived' => 'مؤرشف',
        ];

        $oldStatusLabel = $statusLabels[$oldStatus] ?? $oldStatus;
        $newStatusLabel = $statusLabels[$newStatus] ?? $newStatus;
        $message = "تم تغيير حالة المشروع '{$project->title}' من {$oldStatusLabel} إلى {$newStatusLabel}";

        // Notify supervisor
        if ($project->supervisor) {
            $this->notificationService->create(
                $project->supervisor,
                $message,
                'project_status_changed',
                'project',
                $project->id
            );
        }

        // Notify all related students
        foreach ($project->students as $student) {
            $this->notificationService->create(
                $student,
                $message,
                'project_status_changed',
                'project',
                $project->id
            );
        }
    }

    /**
     * Phase status helper methods
     */
    protected function getProposalPhaseStatus(Project $project): string
    {
        if ($project->proposals->where('status', 'approved')->count() > 0) {
            return 'completed';
        }
        return $project->proposals->count() > 0 ? 'in_progress' : 'pending';
    }

    protected function getRegistrationPhaseStatus(Project $project): string
    {
        if ($project->assigned_group_id && $project->students->count() > 0) {
            return 'completed';
        }
        return $project->registrations->count() > 0 ? 'in_progress' : 'pending';
    }

    protected function getSupervisionPhaseStatus(Project $project): string
    {
        if ($project->supervisor_id) {
            return $project->supervisorNotes->count() > 0 ? 'completed' : 'in_progress';
        }
        return 'pending';
    }

    protected function getDocumentsPhaseStatus(Project $project): string
    {
        $docs = $project->documents;
        if ($docs->count() === 0) return 'pending';
        if ($docs->where('review_status', 'pending')->count() === 0 && $docs->count() > 0) {
            return 'completed';
        }
        return 'in_progress';
    }

    protected function getMilestonesPhaseStatus(Project $project): string
    {
        $milestones = $project->milestones;
        if ($milestones->count() === 0) return 'pending';
        if ($milestones->where('is_completed', false)->count() === 0) {
            return 'completed';
        }
        return 'in_progress';
    }

    protected function getEvaluationPhaseStatus(Project $project): string
    {
        if ($project->committeeMembers->count() === 0) return 'pending';
        if ($project->grades->where('is_approved', true)->count() > 0) {
            return 'completed';
        }
        return 'in_progress';
    }

    protected function calculateOverallProgress(Project $project): int
    {
        $phases = [
            $this->getProposalPhaseStatus($project),
            $this->getRegistrationPhaseStatus($project),
            $this->getSupervisionPhaseStatus($project),
            $this->getDocumentsPhaseStatus($project),
            $this->getMilestonesPhaseStatus($project),
            $this->getEvaluationPhaseStatus($project),
        ];

        $settingsService = app(\App\Services\SettingsService::class);
        $completedWeight = $settingsService->getProjectProgressCompletedWeight();
        $inProgressWeight = $settingsService->getProjectProgressInProgressWeight();

        $completed = collect($phases)->filter(fn($s) => $s === 'completed')->count();
        $inProgress = collect($phases)->filter(fn($s) => $s === 'in_progress')->count();

        return (int)(($completed * $completedWeight + $inProgress * $inProgressWeight) / count($phases));
    }
}


