<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(
        protected ReportService $reportService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $report = $this->reportService->generateAdminReport();

        return response()->json([
            'success' => true,
            'data' => $report,
        ]);
    }
}

