<?php

namespace App\Services;

use App\Models\TimePeriod;
use App\Enums\TimePeriodType;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class TimeWindowService
{
    /**
     * Check if a specific window type is currently active
     */
    public function isWindowActive(string|TimePeriodType $windowType): bool
    {
        $type = is_string($windowType) ? $windowType : $windowType->value;

        return TimePeriod::where('type', $type)
            ->where('is_active', true)
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->exists();
    }

    /**
     * Get active window for a specific type
     */
    public function getActiveWindow(string|TimePeriodType $windowType): ?TimePeriod
    {
        $type = is_string($windowType) ? $windowType : $windowType->value;

        return TimePeriod::where('type', $type)
            ->where('is_active', true)
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->first();
    }

    /**
     * Get all currently active windows
     */
    public function getAllActiveWindows(): Collection
    {
        return TimePeriod::where('is_active', true)
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->get();
    }

    /**
     * Get upcoming windows (future windows)
     */
    public function getUpcomingWindows(): Collection
    {
        return TimePeriod::where('is_active', true)
            ->where('start_date', '>', now())
            ->orderBy('start_date', 'asc')
            ->get();
    }

    /**
     * Check if a window will be active at a specific date
     */
    public function willBeActiveAt(string|TimePeriodType $windowType, Carbon $date): bool
    {
        $type = is_string($windowType) ? $windowType : $windowType->value;

        return TimePeriod::where('type', $type)
            ->where('is_active', true)
            ->where('start_date', '<=', $date)
            ->where('end_date', '>=', $date)
            ->exists();
    }

    /**
     * Get window status for multiple types
     */
    public function getWindowsStatus(array $types): array
    {
        $status = [];

        foreach ($types as $type) {
            $window = $this->getActiveWindow($type);
            $status[$type] = [
                'is_active' => $window !== null,
                'window' => $window,
                'days_remaining' => $window ? now()->diffInDays($window->end_date, false) : null,
            ];
        }

        return $status;
    }

    /**
     * Check if action is allowed based on window and user role
     */
    public function canPerformAction(string|TimePeriodType $windowType, ?\App\Models\User $user): array
    {
        // Projects committee can always perform actions
        if ($user && $user->isProjectsCommittee()) {
            return [
                'allowed' => true,
                'reason' => 'projects_committee_bypass',
            ];
        }

        $window = $this->getActiveWindow($windowType);

        if (!$window) {
            return [
                'allowed' => false,
                'reason' => 'window_closed',
                'message' => 'لا توجد نافذة زمنية نشطة لهذا الإجراء',
            ];
        }

        return [
            'allowed' => true,
            'window' => $window,
            'days_remaining' => now()->diffInDays($window->end_date, false),
        ];
    }
}
