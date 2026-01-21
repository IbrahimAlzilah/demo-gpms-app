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
            $period = TimePeriod::create([
                ...$validated,
                'created_by' => $request->user()->id,
                'is_active' => true,
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

        // Notify all students about the new period
        $students = \App\Models\User::role('student')->get(['id']);
        if ($students->isNotEmpty()) {
            $now = now();
            $notifications = $students->map(function ($student) use ($period, $now) {
                return [
                    'user_id' => $student->id,
                    'message' => json_encode([
                        'key' => 'notifications.periods.new_announcement',
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
                    'message' => "A time period with type '{$typeLabel}' already exists.",
                    'errors' => [
                        'type' => ["A time period with this type already exists. Please update the existing period or delete it first."],
                    ],
                ], 422);
            }
        }

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

        // Notify students if the period was just activated
        if ($period->wasChanged('is_active') && $period->is_active) {
            $students = \App\Models\User::role('student')->get(['id']);
            if ($students->isNotEmpty()) {
                $now = now();
                $notifications = $students->map(function ($student) use ($period, $now) {
                    return [
                        'user_id' => $student->id,
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
}

