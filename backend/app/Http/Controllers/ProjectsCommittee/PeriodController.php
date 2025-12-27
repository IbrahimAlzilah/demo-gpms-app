<?php

namespace App\Http\Controllers\ProjectsCommittee;

use App\Http\Controllers\Controller;
use App\Http\Resources\TimePeriodResource;
use App\Models\TimePeriod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PeriodController extends Controller
{
    public function index(): JsonResponse
    {
        $periods = TimePeriod::with('creator')->get();

        return response()->json([
            'success' => true,
            'data' => TimePeriodResource::collection($periods),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:proposal_submission,project_registration,document_submission,supervisor_evaluation,committee_evaluation,final_discussion,general',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'academic_year' => 'nullable|string',
            'semester' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $period = TimePeriod::create([
            ...$validated,
            'created_by' => $request->user()->id,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'data' => new TimePeriodResource($period->load('creator')),
            'message' => 'Period created successfully',
        ], 201);
    }

    public function update(Request $request, TimePeriod $period): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:proposal_submission,project_registration,document_submission,supervisor_evaluation,committee_evaluation,final_discussion,general',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after:start_date',
            'is_active' => 'sometimes|boolean',
            'academic_year' => 'nullable|string',
            'semester' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $period->update($validated);

        return response()->json([
            'success' => true,
            'data' => new TimePeriodResource($period->fresh()->load('creator')),
            'message' => 'Period updated successfully',
        ]);
    }
}

