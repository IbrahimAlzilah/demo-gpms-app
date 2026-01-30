<?php

namespace App\Http\Controllers\ProjectsCommittee;

use App\Http\Controllers\Controller;
use App\Http\Resources\TimePeriodResource;
use App\Http\Traits\HasTableQuery;
use App\Models\TimePeriod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PeriodController extends Controller
{
    use HasTableQuery;

    public function index(Request $request): JsonResponse
    {
        $query = TimePeriod::with('creator');

        $query = $this->applyTableQuery($query, $request);

        return response()->json($this->getPaginatedResponse($query, $request, TimePeriodResource::class));
    }

    public function store(Request $request): JsonResponse
    {
        $allowedTypes = \App\Enums\TimePeriodType::values();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => [
                'required',
                'in:' . implode(',', $allowedTypes),
                function ($attribute, $value, $fail) {
                    // Check if a period with this type already exists
                    $existingPeriod = TimePeriod::where('type', $value)->first();
                    if ($existingPeriod) {
                        $typeLabel = \App\Enums\TimePeriodType::from($value)->label();
                        $fail("A time period with type '{$typeLabel}' already exists. Please update the existing period or delete it first.");
                    }
                },
            ],
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'academic_year' => 'nullable|string',
            'semester' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        try {
            // Create period as inactive by default - it will be activated when start date is reached
            // or manually by the committee
            $period = TimePeriod::create([
                ...$validated,
                'created_by' => $request->user()->id,
                'is_active' => false, // Default to false - period is scheduled but not yet active
            ]);
        } catch (\Illuminate\Database\QueryException $e) {
            // Handle unique constraint violation
            if ($e->getCode() === '23000' && str_contains($e->getMessage(), 'Duplicate entry')) {
                $typeLabel = \App\Enums\TimePeriodType::from($validated['type'])->label();
                return response()->json([
                    'success' => false,
                    'message' => "A time period with type '{$typeLabel}' already exists.",
                    'errors' => [
                        'type' => ["A time period with this type already exists. Please update the existing period or delete it first."],
                    ],
                ], 422);
            }
            throw $e;
        }

        // Do NOT send notifications immediately upon creation
        // Notifications will be sent automatically when the period becomes active
        // (either when start date is reached via scheduled command, or manually activated)

        return response()->json([
            'success' => true,
            'data' => new TimePeriodResource($period->load('creator')),
            'message' => 'Period created successfully',
        ], 201);
    }

    public function update(Request $request, TimePeriod $period): JsonResponse
    {
        $allowedTypes = \App\Enums\TimePeriodType::values();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:' . implode(',', $allowedTypes),
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date',
            'is_active' => 'sometimes|boolean',
            'academic_year' => 'nullable|string',
            'semester' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        // Check if period has expired before allowing activation/deactivation
        if (isset($validated['is_active'])) {
            $endDate = $validated['end_date'] ?? $period->end_date;
            $today = now()->startOfDay();

            if ($endDate && $endDate < $today) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot modify an expired period. The period has already ended and its status cannot be changed.',
                    'errors' => [
                        'is_active' => ['This period has expired and cannot be activated or deactivated.'],
                    ],
                ], 422);
            }
        }

        // Validate date range: end_date must be after start_date
        // Use validated start_date if provided, otherwise use existing period start_date
        $startDate = $validated['start_date'] ?? $period->start_date?->toDateString();
        $endDate = $validated['end_date'] ?? $period->end_date?->toDateString();

        if ($startDate && $endDate) {
            if (strtotime($endDate) <= strtotime($startDate)) {
                return response()->json([
                    'success' => false,
                    'message' => 'The end date must be after the start date.',
                    'errors' => [
                        'end_date' => ['The end date must be after the start date.'],
                    ],
                ], 422);
            }
        }

        // Check for duplicate type if type is being changed
        if (isset($validated['type']) && $validated['type'] !== $period->type) {
            $existingPeriod = TimePeriod::where('type', $validated['type'])
                ->where('id', '!=', $period->id)
                ->first();

            if ($existingPeriod) {
                $typeLabel = \App\Enums\TimePeriodType::from($validated['type'])->label();
                return response()->json([
                    'success' => false,
                    'message' => "A time period with type '{$typeLabel}' already exists. Please update the existing period or delete it first.",
                    'errors' => [
                        'type' => ["A time period with this type already exists. Please update the existing period or delete it first."],
                    ],
                ], 422);
            }
        }

        // Check for overlapping dates if dates or type are being changed
        $checkStartDate = $validated['start_date'] ?? $period->start_date?->toDateString();
        $checkEndDate = $validated['end_date'] ?? $period->end_date?->toDateString();
        $checkType = $validated['type'] ?? $period->type;

        if ($checkStartDate && $checkEndDate && $checkType) {
            $overlapping = TimePeriod::where('type', $checkType)
                ->where('id', '!=', $period->id)
                ->where(function ($query) use ($checkStartDate, $checkEndDate) {
                    $query->whereBetween('start_date', [$checkStartDate, $checkEndDate])
                        ->orWhereBetween('end_date', [$checkStartDate, $checkEndDate])
                        ->orWhere(function ($q) use ($checkStartDate, $checkEndDate) {
                            $q->where('start_date', '<=', $checkStartDate)
                              ->where('end_date', '>=', $checkEndDate);
                        });
                })
                ->first();

            if ($overlapping) {
                $typeLabel = \App\Enums\TimePeriodType::from($checkType)->label();
                return response()->json([
                    'success' => false,
                    'message' => "A time period with type '{$typeLabel}' already exists with overlapping dates. Please update the existing period or delete it first.",
                    'errors' => [
                        'start_date' => ["A time period with this type already exists with overlapping dates. Please update the existing period or delete it first."],
                    ],
                ], 422);
            }
        }

        // Store original is_active state before update
        $wasActiveBefore = $period->is_active;

        try {
            $period->update($validated);
        } catch (\Illuminate\Database\QueryException $e) {
            // Handle unique constraint violation
            if ($e->getCode() === '23000' && str_contains($e->getMessage(), 'Duplicate entry')) {
                $typeLabel = isset($validated['type'])
                    ? \App\Enums\TimePeriodType::from($validated['type'])->label()
                    : \App\Enums\TimePeriodType::from($period->type)->label();
                return response()->json([
                    'success' => false,
                    'message' => "A time period with type '{$typeLabel}' already exists.",
                    'errors' => [
                        'type' => ["A time period with this type already exists. Please update the existing period or delete it first."],
                    ],
                ], 422);
            }
            throw $e;
        }

        // Refresh period to get latest data (in case dates were updated)
        $period->refresh();

        // Notify students only if the period was just activated (changed from inactive to active)
        // AND the start date has been reached
        if (!$wasActiveBefore && $period->is_active) {
            // Only send notifications if the period's start date has been reached
            if ($period->start_date <= now()->startOfDay()) {
                $this->sendPeriodActivationNotifications($period);
            }
        }

        return response()->json([
            'success' => true,
            'data' => new TimePeriodResource($period->fresh()->load('creator')),
            'message' => 'Period updated successfully',
        ]);
    }

    public function destroy(TimePeriod $period): JsonResponse
    {
        $period->delete();

        return response()->json([
            'success' => true,
            'message' => 'Period deleted successfully',
        ]);
    }

    protected function applySearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        });
    }

    protected function applyFilters($query, array $filters)
    {
        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }
        if (isset($filters['isActive'])) {
            $isActive = $filters['isActive'] === 'active' || $filters['isActive'] === true || $filters['isActive'] === '1';
            $query->where('is_active', $isActive);
        }
        return $query;
    }

    /**
     * Send activation notifications for a period.
     *
     * Requirements for Proposal Submission Period:
     * - Notify supervisors only
     * - Do NOT notify students
     * For other periods, keep existing student notifications behaviour.
     */
    protected function sendPeriodActivationNotifications(TimePeriod $period): void
    {
        // Determine recipients based on period type
        if ($period->type === \App\Enums\TimePeriodType::PROPOSAL_SUBMISSION->value) {
            // Proposal Submission Period -> supervisors only
            $recipients = \App\Models\User::where('role', 'supervisor')
                ->where('status', 'active')
                ->get(['id']);
        } else {
            // Default behaviour: notify students (backward compatible)
            $recipients = \App\Models\User::role('student')->get(['id']);
        }

        if ($recipients->isEmpty()) {
            return;
        }

        $now = now();
        $notifications = $recipients->map(function ($user) use ($period, $now) {
            return [
                'user_id' => $user->id,
                'message' => json_encode([
                    'key' => 'notifications.periods.activated',
                    'params' => [
                        'type' => $period->type,
                        'name' => $period->name,
                    ],
                ]),
                'type' => 'period_announcement',
                'related_entity_type' => TimePeriod::class,
                'related_entity_id' => $period->id,
                'is_read' => false,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        })->toArray();

        \App\Models\Notification::insert($notifications);
    }
}

