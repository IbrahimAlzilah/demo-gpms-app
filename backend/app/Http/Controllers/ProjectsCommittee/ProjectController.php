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
        }

        // Filter projects without supervisor
        if ($request->has('supervisor_id') && $request->supervisor_id === 'null') {
            $query->whereNull('supervisor_id');
        }

        $query = $this->applyTableQuery($query, $request);

        return response()->json($this->getPaginatedResponse($query, $request, ProjectResource::class));
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
                ->get();

            foreach ($projects as $project) {
                $project->update(['status' => ProjectStatus::AVAILABLE_FOR_REGISTRATION->value]);
            }

            $announcedProjects = Project::whereIn('id', $projectIds)
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

