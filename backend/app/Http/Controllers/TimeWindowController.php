<?php

namespace App\Http\Controllers;

use App\Http\Resources\TimePeriodResource;
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
            'data' => TimePeriodResource::collection($windows),
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
            'data' => TimePeriodResource::collection($windows),
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
                'isActive' => $isActive,
                'window' => $window ? new TimePeriodResource($window) : null,
                'daysRemaining' => $isActive ? now()->diffInDays($window->end_date, false) : null,
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

        // Transform windows in status array to use Resources
        $transformedStatus = [];
        foreach ($status as $type => $statusData) {
            $transformedStatus[$type] = [
                'isActive' => $statusData['is_active'],
                'window' => $statusData['window'] ? new TimePeriodResource($statusData['window']) : null,
                'daysRemaining' => $statusData['days_remaining'],
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $transformedStatus,
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
