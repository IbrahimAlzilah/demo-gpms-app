<?php

namespace App\Http\Controllers;

use App\Services\TimeWindowService;
use App\Enums\TimePeriodType;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TimeWindowController extends Controller
{
    public function __construct(
        protected TimeWindowService $timeWindowService
    ) {}

    /**
     * Get all currently active windows
     */
    public function activeWindows(): JsonResponse
    {
        $windows = $this->timeWindowService->getAllActiveWindows();

        return response()->json([
            'success' => true,
            'data' => $windows,
        ]);
    }

    /**
     * Get upcoming windows
     */
    public function upcomingWindows(): JsonResponse
    {
        $windows = $this->timeWindowService->getUpcomingWindows();

        return response()->json([
            'success' => true,
            'data' => $windows,
        ]);
    }

    /**
     * Check if specific window is active
     */
    public function checkWindow(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|string',
        ]);

        $type = $request->input('type');
        $window = $this->timeWindowService->getActiveWindow($type);
        $isActive = $window !== null;

        return response()->json([
            'success' => true,
            'data' => [
                'type' => $type,
                'is_active' => $isActive,
                'window' => $window,
                'days_remaining' => $isActive ? now()->diffInDays($window->end_date, false) : null,
            ],
        ]);
    }

    /**
     * Get status for multiple window types
     */
    public function windowsStatus(Request $request): JsonResponse
    {
        $request->validate([
            'types' => 'required|array',
            'types.*' => 'required|string',
        ]);

        $types = $request->input('types');
        $status = $this->timeWindowService->getWindowsStatus($types);

        return response()->json([
            'success' => true,
            'data' => $status,
        ]);
    }

    /**
     * Get window types enum values
     */
    public function windowTypes(): JsonResponse
    {
        $types = [];

        foreach (TimePeriodType::cases() as $type) {
            $types[] = [
                'value' => $type->value,
                'label' => $type->label(),
                'description' => $type->description(),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $types,
        ]);
    }
}
