<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Http\Traits\HasTableQuery;
use App\Models\Project;
use App\Models\ProjectRegistration;
use App\Services\ProjectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    use HasTableQuery;

    public function __construct(
        protected ProjectService $projectService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Project::with(['supervisor', 'students']);

        // Show available projects or student's registered projects
        if ($request->has('available') && $request->available) {
            $query->where('status', 'available_for_registration');
        } else {
            $query->whereHas('students', function ($q) use ($request) {
                $q->where('users.id', $request->user()->id);
            });
        }

        $query = $this->applyTableQuery($query, $request);

        return response()->json($this->getPaginatedResponse($query, $request));
    }

    public function show(Project $project): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new ProjectResource($project->load(['supervisor', 'students', 'group'])),
        ]);
    }

    public function register(Request $request, Project $project): JsonResponse
    {
        try {
            $registration = $this->projectService->registerStudent($project, $request->user());

            return response()->json([
                'success' => true,
                'data' => $registration,
                'message' => 'Registration submitted successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function getRegistrations(Request $request): JsonResponse
    {
        $registrations = ProjectRegistration::where('student_id', $request->user()->id)
            ->with(['project', 'reviewer'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $registrations,
        ]);
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
        return $query;
    }
}

