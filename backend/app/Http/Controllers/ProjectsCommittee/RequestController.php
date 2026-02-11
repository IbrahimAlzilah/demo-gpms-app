<?php

namespace App\Http\Controllers\ProjectsCommittee;

use App\Http\Controllers\Controller;
use App\Http\Resources\RequestResource;
use App\Http\Resources\ProjectResource;
use App\Http\Resources\ProjectRegistrationResource;
use App\Http\Resources\StudentGroupResource;
use App\Http\Traits\HasTableQuery;
use App\Models\ProjectRequest;
use App\Models\ProjectRegistration;
use App\Models\StudentGroup;
use App\Models\Project;
use App\Services\RequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RequestController extends Controller
{
    use HasTableQuery;

    public function __construct(
        protected RequestService $requestService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = ProjectRequest::query()
            ->with(['student', 'project'])
            ->where('status', '!=', 'cancelled'); // Committee does not see student-cancelled requests

        // Apply status filter if provided
        $filters = $request->get('filters', []);
        $statusFilter = $filters['status'] ?? null;

        // Remove status filter from filters array to avoid double application in applyTableQuery
        if (isset($filters['status'])) {
            unset($filters['status']);
            $request->merge(['filters' => $filters]);
        }

        // Apply status filter only when a specific status is selected (not "all" or empty)
        if ($statusFilter && $statusFilter !== 'all') {
            $query->where('status', $statusFilter);
        }

        $query = $this->applyTableQuery($query, $request);

        return response()->json($this->getPaginatedResponse($query, $request, RequestResource::class));
    }

    /**
     * Show a single request with enriched data for committee decision.
     * For change_group: includes currentGroup, currentProject, targetGroup.
     * For change_project: includes currentGroup, currentProject, targetProject.
     * Handles null student/project safely (e.g. deleted user or project).
     */
    public function show(ProjectRequest $projectRequest): JsonResponse
    {
        $projectRequest->load(['student', 'project']);
        $data = (new RequestResource($projectRequest))->toArray(request());

        $student = $projectRequest->student;
        $additional = is_array($projectRequest->additional_data) ? $projectRequest->additional_data : [];

        // Only enrich with group/project context when student exists (avoid null->id)
        if ($student !== null) {
            $currentGroup = StudentGroup::where(function ($q) use ($student) {
                $q->where('leader_id', $student->id)
                    ->orWhereHas('members', fn ($m) => $m->where('users.id', $student->id));
            })->where('status', 'active')->with(['leader', 'members'])->first();

            $currentProject = $currentGroup !== null
                ? Project::where('assigned_group_id', $currentGroup->id)->with(['supervisor', 'assignedGroup.leader', 'assignedGroup.members'])->first()
                : null;

            if ($projectRequest->type === 'change_group') {
                $data['currentGroup'] = $currentGroup !== null ? (new StudentGroupResource($currentGroup))->toArray(request()) : null;
                $data['currentProject'] = $currentProject !== null ? (new ProjectResource($currentProject))->toArray(request()) : null;
                $targetGroupId = $additional['target_group_id'] ?? $additional['targetGroupId'] ?? null;
                $targetGroup = $targetGroupId
                    ? StudentGroup::where('id', $targetGroupId)->where('status', 'active')->with(['leader', 'members'])->first()
                    : null;
                $data['targetGroup'] = $targetGroup !== null ? (new StudentGroupResource($targetGroup))->toArray(request()) : null;
            }

            if ($projectRequest->type === 'change_project') {
                $data['currentGroup'] = $currentGroup !== null ? (new StudentGroupResource($currentGroup))->toArray(request()) : null;
                $data['currentProject'] = $currentProject !== null ? (new ProjectResource($currentProject))->toArray(request()) : null;
                $targetProjectId = $additional['target_project_id'] ?? $additional['targetProjectId'] ?? null;
                $targetProject = $targetProjectId ? Project::find($targetProjectId) : null;
                $data['targetProject'] = $targetProject !== null
                    ? (new ProjectResource($targetProject->load(['supervisor', 'assignedGroup'])))->toArray(request())
                    : null;
            }

            // Include student's project registrations for committee context
            $studentRegistrations = ProjectRegistration::where('student_id', $student->id)
                ->with(['project.supervisor', 'reviewer'])
                ->orderBy('submitted_at', 'desc')
                ->get();
            $data['studentRegistrations'] = $studentRegistrations->map(
                fn ($reg) => (new ProjectRegistrationResource($reg))->toArray(request())
            )->values()->all();
        }

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function approve(Request $request, ProjectRequest $projectRequest): JsonResponse
    {
        try {
            $approved = $this->requestService->approveByCommittee(
                $projectRequest,
                $request->user(),
                $request->input('comments')
            );

            return response()->json([
                'success' => true,
                'data' => new RequestResource($approved->load(['student', 'project'])),
                'message' => 'Request approved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function reject(Request $request, ProjectRequest $projectRequest): JsonResponse
    {
        try {
            $rejected = $this->requestService->rejectByCommittee(
                $projectRequest,
                $request->user(),
                $request->input('comments')
            );

            return response()->json([
                'success' => true,
                'data' => new RequestResource($rejected->load(['student', 'project'])),
                'message' => 'Request rejected',
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
            $q->where('reason', 'like', "%{$search}%")
                ->orWhereHas('student', function ($studentQuery) use ($search) {
                    $studentQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })
                ->orWhereHas('project', function ($projectQuery) use ($search) {
                    $projectQuery->where('title', 'like', "%{$search}%");
                });
        });
    }

    protected function applyFilters($query, array $filters)
    {
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }
        return $query;
    }
}

