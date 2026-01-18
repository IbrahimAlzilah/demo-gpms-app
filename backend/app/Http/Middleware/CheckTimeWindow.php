<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\TimePeriod;

class CheckTimeWindow
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $windowType  The type of time period to check
     */
    public function handle(Request $request, Closure $next, string $windowType): Response
    {
        // Projects committee bypasses time window checks
        if ($request->user() && $request->user()->isProjectsCommittee()) {
            return $next($request);
        }

        // Check if there's an active time period of the specified type
        $activeWindow = TimePeriod::where('type', $windowType)
            ->where('is_active', true)
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->first();

        if (!$activeWindow) {
            return response()->json([
                'success' => false,
                'message' => "لا توجد نافذة زمنية نشطة لهذا الإجراء. النوع المطلوب: {$windowType}",
                'error' => 'TIME_WINDOW_CLOSED',
                'data' => [
                    'window_type' => $windowType,
                ],
            ], 403);
        }

        // Add the active window to the request for use in controllers
        $request->attributes->add(['active_window' => $activeWindow]);

        return $next($request);
    }
}
