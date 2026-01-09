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

    public function index(Request $request): JsonResponse
    {
        $query = Project::with(['supervisor', 'students']);

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

    public function show(Project $project): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new ProjectResource($project->load(['supervisor', 'students', 'group'])),
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

    protected function applySearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
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
        return $query;
    }
}

