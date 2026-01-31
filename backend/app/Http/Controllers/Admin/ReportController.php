<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReportFiltersRequest;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(
        protected ReportService $reportService
    ) {}

    /**
     * Legacy endpoint - returns combined admin report
     */
    public function index(Request $request): JsonResponse
    {
        $report = $this->reportService->generateAdminReport();

        return response()->json([
            'success' => true,
            'data' => $report,
        ]);
    }

    /**
     * Get overview report with KPIs (includes users)
     */
    public function overview(ReportFiltersRequest $request): JsonResponse
    {
        $filters = $request->validated();
        $report = $this->reportService->generateAdminOverviewReport($filters);

        return response()->json([
            'success' => true,
            'data' => $report,
        ]);
    }

    /**
     * Get users report (Admin-specific)
     */
    public function users(ReportFiltersRequest $request): JsonResponse
    {
        $filters = $request->validated();
        $report = $this->reportService->generateUsersReport($filters);

        return response()->json([
            'success' => true,
            'data' => $report,
        ]);
    }

    /**
     * Get system configuration report (time periods, active windows)
     */
    public function system(Request $request): JsonResponse
    {
        $report = $this->reportService->generateSystemReport();

        return response()->json([
            'success' => true,
            'data' => $report,
        ]);
    }

    /**
     * Get projects report
     */
    public function projects(ReportFiltersRequest $request): JsonResponse
    {
        $filters = $request->validated();
        $report = $this->reportService->generateProjectsReport($filters);

        return response()->json([
            'success' => true,
            'data' => $report,
        ]);
    }

    /**
     * Get supervisors report
     */
    public function supervisors(ReportFiltersRequest $request): JsonResponse
    {
        $filters = $request->validated();
        $report = $this->reportService->generateSupervisorsReport($filters);

        return response()->json([
            'success' => true,
            'data' => $report,
        ]);
    }

    /**
     * Get students report
     */
    public function students(ReportFiltersRequest $request): JsonResponse
    {
        $filters = $request->validated();
        $report = $this->reportService->generateStudentsReport($filters);

        return response()->json([
            'success' => true,
            'data' => $report,
        ]);
    }

    /**
     * Get requests report
     */
    public function requests(ReportFiltersRequest $request): JsonResponse
    {
        $filters = $request->validated();
        $report = $this->reportService->generateRequestsReport($filters);

        return response()->json([
            'success' => true,
            'data' => $report,
        ]);
    }

    /**
     * Get deadlines report
     */
    public function deadlines(ReportFiltersRequest $request): JsonResponse
    {
        $filters = $request->validated();
        $report = $this->reportService->generateDeadlinesReport($filters);

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
}
