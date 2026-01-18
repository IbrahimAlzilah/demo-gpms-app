<?php

namespace App\Http\Controllers\ProjectsCommittee;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReportFiltersRequest;
use App\Http\Traits\HasTableQuery;
use App\Models\Project;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    use HasTableQuery;

    public function __construct(
        protected ReportService $reportService
    ) {}

    /**
     * Legacy endpoint - kept for backward compatibility
     */
    public function index(Request $request): JsonResponse
    {
        $report = $this->reportService->generateProjectsCommitteeReport();

        return response()->json([
            'success' => true,
            'data' => $report,
        ]);
    }

    /**
     * Get overview report with KPIs and charts
     */
    public function overview(ReportFiltersRequest $request): JsonResponse
    {
        $filters = $request->validated();
        $report = $this->reportService->generateOverviewReport($filters);

        return response()->json([
            'success' => true,
            'data' => $report,
        ]);
    }

    /**
     * Get projects report with drill-down data
     */
    public function projects(ReportFiltersRequest $request): JsonResponse
    {
        $filters = $request->validated();
        
        // Get base projects query with filters
        $baseQuery = Project::with(['supervisor', 'students']);
        $this->applyCommonFiltersToQuery($baseQuery, $filters);
        
        // Apply search if provided
        if ($request->has('search') && $request->search) {
            $baseQuery = $this->applySearch($baseQuery, $request->search);
        }

        // Apply sorting
        if ($request->has('sortBy') && $request->sortBy) {
            $sortOrder = $request->get('sortOrder', 'asc');
            $baseQuery = $this->applySorting($baseQuery, $request->sortBy, $sortOrder);
        } else {
            $baseQuery->orderBy('created_at', 'desc');
        }

        // Get summary first
        $summaryQuery = $this->reportService->generateProjectsReport($filters);
        
        // Get paginated response
        $response = $this->getPaginatedResponse($baseQuery, $request);

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => $summaryQuery['summary'],
                'projects' => $response['data'],
                'pagination' => $response['pagination'],
            ],
        ]);
    }

    /**
     * Get supervisors workload report
     */
    public function supervisors(ReportFiltersRequest $request): JsonResponse
    {
        $filters = $request->validated();
        $report = $this->reportService->generateSupervisorsReport($filters);

        // Apply pagination if needed
        $supervisors = collect($report['supervisors']);
        
        if ($request->has('page') || $request->has('pageSize')) {
            $page = (int) $request->get('page', 1);
            $pageSize = (int) $request->get('pageSize', 10);
            $total = $supervisors->count();
            $totalPages = ceil($total / $pageSize);
            
            $paginated = $supervisors->skip(($page - 1) * $pageSize)
                ->take($pageSize)
                ->values();

            return response()->json([
                'success' => true,
                'data' => [
                    'summary' => $report['summary'],
                    'supervisors' => $paginated,
                    'pagination' => [
                        'page' => $page,
                        'pageSize' => $pageSize,
                        'total' => $total,
                        'totalPages' => $totalPages,
                    ],
                ],
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $report,
        ]);
    }

    /**
     * Get students participation report
     */
    public function students(ReportFiltersRequest $request): JsonResponse
    {
        $filters = $request->validated();
        $report = $this->reportService->generateStudentsReport($filters);

        // Apply pagination if needed
        $students = collect($report['students']);
        
        if ($request->has('page') || $request->has('pageSize')) {
            $page = (int) $request->get('page', 1);
            $pageSize = (int) $request->get('pageSize', 10);
            $total = $students->count();
            $totalPages = ceil($total / $pageSize);
            
            $paginated = $students->skip(($page - 1) * $pageSize)
                ->take($pageSize)
                ->values();

            return response()->json([
                'success' => true,
                'data' => [
                    'summary' => $report['summary'],
                    'students' => $paginated,
                    'pagination' => [
                        'page' => $page,
                        'pageSize' => $pageSize,
                        'total' => $total,
                        'totalPages' => $totalPages,
                    ],
                ],
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $report,
        ]);
    }

    /**
     * Get requests lifecycle report
     */
    public function requests(ReportFiltersRequest $request): JsonResponse
    {
        $filters = $request->validated();
        
        $report = $this->reportService->generateRequestsReport($filters);
        $requests = collect($report['requests']);

        // Apply table query for pagination
        $baseQuery = \App\Models\ProjectRequest::query();
        $this->applyCommonFiltersToQuery($baseQuery, $filters);
        
        if ($request->has('search') && $request->search) {
            $baseQuery = $this->applySearch($baseQuery, $request->search);
        }

        if ($request->has('sortBy') && $request->sortBy) {
            $sortOrder = $request->get('sortOrder', 'asc');
            $baseQuery = $this->applySorting($baseQuery, $request->sortBy, $sortOrder);
        } else {
            $baseQuery->orderBy('created_at', 'desc');
        }

        $response = $this->getPaginatedResponse($baseQuery, $request);

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => $report['summary'],
                'requests' => $response['data'],
                'pagination' => $response['pagination'],
            ],
        ]);
    }

    /**
     * Get deadlines and delays report
     */
    public function deadlines(ReportFiltersRequest $request): JsonResponse
    {
        $filters = $request->validated();
        $report = $this->reportService->generateDeadlinesReport($filters);

        // Apply pagination for overdue milestones
        $overdue = collect($report['overdue_milestones']);
        
        if ($request->has('page') || $request->has('pageSize')) {
            $page = (int) $request->get('page', 1);
            $pageSize = (int) $request->get('pageSize', 10);
            $total = $overdue->count();
            $totalPages = ceil($total / $pageSize);
            
            $paginated = $overdue->skip(($page - 1) * $pageSize)
                ->take($pageSize)
                ->values();

            return response()->json([
                'success' => true,
                'data' => [
                    'summary' => $report['summary'],
                    'overdue_milestones' => $paginated,
                    'pagination' => [
                        'page' => $page,
                        'pageSize' => $pageSize,
                        'total' => $total,
                        'totalPages' => $totalPages,
                    ],
                ],
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $report,
        ]);
    }

    /**
     * Get historical comparison report
     */
    public function history(Request $request): JsonResponse
    {
        $periodsCount = (int) $request->get('periods_count', 5);
        $report = $this->reportService->generateHistoryReport($periodsCount);

        return response()->json([
            'success' => true,
            'data' => $report,
        ]);
    }

    /**
     * Apply common filters to a query builder
     */
    protected function applyCommonFiltersToQuery($query, array $filters): void
    {
        $dateRange = $this->reportService->getPeriodDateRange($filters['period_id'] ?? null);

        if ($dateRange) {
            $query->whereBetween('created_at', [$dateRange['from'], $dateRange['to']]);
        } elseif (isset($filters['date_from']) || isset($filters['date_to'])) {
            if (isset($filters['date_from'])) {
                $query->where('created_at', '>=', $filters['date_from']);
            }
            if (isset($filters['date_to'])) {
                $query->where('created_at', '<=', \Carbon\Carbon::parse($filters['date_to'])->endOfDay());
            }
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (isset($filters['supervisor_id'])) {
            $query->where('supervisor_id', $filters['supervisor_id']);
        }
        if (isset($filters['project_specialization'])) {
            $query->where('specialization', $filters['project_specialization']);
        }
        if (isset($filters['request_status'])) {
            $query->where('status', $filters['request_status']);
        }
        if (isset($filters['request_type'])) {
            $query->where('type', $filters['request_type']);
        }
    }

    /**
     * Apply search to projects query
     */
    protected function applySearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        });
    }
}

