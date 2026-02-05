<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\TimePeriod;
use Carbon\Carbon;

class CheckTimeWindow
{
    /**
     * Handle an incoming request.
     * Start and end dates of periods are inclusive (active on both start and end day).
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $windowTypes  The type(s) of time period to check (comma-separated for multiple types)
     */
    public function handle(Request $request, Closure $next, string $windowTypes): Response
    {
        // Projects committee bypasses time window checks
        if ($request->user() && $request->user()->isProjectsCommittee()) {
            return $next($request);
        }

        // Support multiple window types (comma-separated)
        $types = array_map('trim', explode(',', $windowTypes));
        $today = Carbon::today();

        // Check if there's an active time period for any of the specified types (start/end dates inclusive)
        $activeWindow = TimePeriod::whereIn('type', $types)
            ->where('is_active', true)
            ->where('start_date', '<=', $today)
            ->where('end_date', '>=', $today)
            ->first();

        if (!$activeWindow) {
            $typesList = implode(', ', $types);
            return response()->json([
                'success' => false,
                'message' => "لا توجد نافذة زمنية نشطة لهذا الإجراء. الأنواع المطلوبة: {$typesList}",
                'error' => 'TIME_WINDOW_CLOSED',
                'data' => [
                    'window_types' => $types,
                ],
            ], 403);
        }

        // Add the active window to the request for use in controllers
        $request->attributes->add(['active_window' => $activeWindow]);

        return $next($request);
    }
}
