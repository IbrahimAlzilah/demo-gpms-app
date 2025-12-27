<?php

namespace App\Http\Controllers\DiscussionCommittee;

use App\Http\Controllers\Controller;
use App\Http\Resources\GradeResource;
use App\Models\Project;
use App\Services\EvaluationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EvaluationController extends Controller
{
    public function __construct(
        protected EvaluationService $evaluationService
    ) {}

    public function submitGrade(Request $request, Project $project): JsonResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:users,id',
            'score' => 'required|numeric|min:0',
            'max_score' => 'required|numeric|min:0',
            'criteria' => 'required|array',
            'comments' => 'nullable|string',
            'committee_members' => 'required|array|min:2|max:3',
            'committee_members.*' => 'exists:users,id',
        ]);

        try {
            $student = \App\Models\User::findOrFail($validated['student_id']);
            $grade = $this->evaluationService->submitCommitteeGrade(
                $project,
                $student,
                [
                    'score' => $validated['score'],
                    'maxScore' => $validated['max_score'],
                    'criteria' => $validated['criteria'],
                    'comments' => $validated['comments'] ?? null,
                ],
                $request->user(),
                $validated['committee_members']
            );

            return response()->json([
                'success' => true,
                'data' => new GradeResource($grade->load(['project', 'student'])),
                'message' => 'Grade submitted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function getGrades(Request $request, Project $project): JsonResponse
    {
        $grades = \App\Models\Grade::where('project_id', $project->id)
            ->with(['student', 'project'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => GradeResource::collection($grades),
        ]);
    }
}

