<?php

namespace App\Services;

use App\Models\TimePeriod;
use App\Enums\TimePeriodType;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class TimeWindowService
{
    /**
     * Current date for period checks (start and end dates are inclusive for the whole day).
     */
    protected function today(): Carbon
    {
        return Carbon::today();
    }

    /**
     * Check if a specific window type is currently active.
     * Start date and end date are both inclusive (e.g. period 4 Feb–28 Mar is active on both 4 Feb and 28 Mar).
     */
    public function isWindowActive(string|TimePeriodType $windowType): bool
    {
        $type = is_string($windowType) ? $windowType : $windowType->value;
        $today = $this->today();

        return TimePeriod::where('type', $type)
            ->where('is_active', true)
            ->where('start_date', '<=', $today)
            ->where('end_date', '>=', $today)
            ->exists();
    }

    /**
     * Get active window for a specific type.
     * Start and end dates are inclusive.
     */
    public function getActiveWindow(string|TimePeriodType $windowType): ?TimePeriod
    {
        $type = is_string($windowType) ? $windowType : $windowType->value;
        $today = $this->today();

        return TimePeriod::where('type', $type)
            ->where('is_active', true)
            ->where('start_date', '<=', $today)
            ->where('end_date', '>=', $today)
            ->first();
    }

    /**
     * Get all currently active windows.
     * Start and end dates are inclusive.
     */
    public function getAllActiveWindows(): Collection
    {
        $today = $this->today();

        return TimePeriod::where('is_active', true)
            ->where('start_date', '<=', $today)
            ->where('end_date', '>=', $today)
            ->get();
    }

    /**
     * Get upcoming windows (start date is in the future; start date is exclusive for "upcoming").
     */
    public function getUpcomingWindows(): Collection
    {
        $today = $this->today();

        return TimePeriod::where('is_active', true)
            ->where('start_date', '>', $today)
            ->orderBy('start_date', 'asc')
            ->get();
    }

    /**
     * Check if a window will be active at a specific date.
     * Start and end dates are inclusive for that date.
     */
    public function willBeActiveAt(string|TimePeriodType $windowType, Carbon $date): bool
    {
        $type = is_string($windowType) ? $windowType : $windowType->value;
        $day = $date->copy()->startOfDay();

        return TimePeriod::where('type', $type)
            ->where('is_active', true)
            ->where('start_date', '<=', $day)
            ->where('end_date', '>=', $day)
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
                'days_remaining' => $window ? $this->today()->diffInDays($window->end_date->startOfDay(), false) : null,
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
            'days_remaining' => $this->today()->diffInDays($window->end_date->startOfDay(), false),
        ];
    }
}
