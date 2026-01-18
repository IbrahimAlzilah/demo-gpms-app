<?php

namespace App\Http\Controllers\DiscussionCommittee;

use App\Http\Controllers\Controller;
use App\Http\Resources\GradeResource;
use App\Models\Grade;
use App\Models\Project;
use App\Services\EvaluationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EvaluationController extends Controller
{
    public function __construct(
        protected EvaluationService $evaluationService
    ) {}

    /**
     * Get evaluations/grades for a project
     * GET /discussion-committee/evaluations?project_id={id}
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
        ]);

        $project = Project::findOrFail($validated['project_id']);

        // Verify user is assigned to this project's committee
        $isAssigned = $project->committeeMembers()->where('users.id', $request->user()->id)->exists();
        
        if (!$isAssigned) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $grades = Grade::where('project_id', $project->id)
            ->with(['student', 'project'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => GradeResource::collection($grades),
        ]);
    }

    /**
     * Submit a grade/evaluation
     * POST /discussion-committee/evaluations
     * 
     * Accepts both payload formats:
     * - Backend format: project_id, student_id, score, max_score, criteria, comments
     * - Frontend format: projectId, studentId, grade.score, grade.maxScore, grade.criteria, grade.comments
     */
    public function store(Request $request): JsonResponse
    {
        // Normalize payload - handle both frontend (camelCase + nested grade) and backend (snake_case) formats
        $projectId = $request->input('project_id') ?? $request->input('projectId');
        $studentId = $request->input('student_id') ?? $request->input('studentId');
        
        // Handle nested grade object from frontend or flat structure
        $gradeData = $request->input('grade');
        $score = $gradeData['score'] ?? $request->input('score');
        $maxScore = $gradeData['maxScore'] ?? $request->input('max_score');
        $criteria = $gradeData['criteria'] ?? $request->input('criteria');
        $comments = $gradeData['comments'] ?? $request->input('comments');

        // Validate normalized data
        $validated = validator([
            'project_id' => $projectId,
            'student_id' => $studentId,
            'score' => $score,
            'max_score' => $maxScore,
            'criteria' => $criteria,
            'comments' => $comments,
        ], [
            'project_id' => 'required|exists:projects,id',
            'student_id' => 'required|exists:users,id',
            'score' => 'required|numeric|min:0',
            'max_score' => 'required|numeric|min:0',
            'criteria' => 'required|array',
            'comments' => 'nullable|string',
        ])->validate();

        $project = Project::findOrFail($validated['project_id']);

        // Verify user is assigned to this project's committee
        $isAssigned = $project->committeeMembers()->where('users.id', $request->user()->id)->exists();
        
        if (!$isAssigned) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - You are not assigned to this project\'s discussion committee',
            ], 403);
        }

        // Derive committee members from database assignments (don't trust client)
        $committeeMembers = $project->committeeMembers()
            ->pluck('users.id')
            ->map(fn($id) => (string) $id)
            ->toArray();

        // Ensure requesting user is in the committee (already verified above, but double-check)
        if (!in_array($request->user()->id, $committeeMembers)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - You are not a member of this project\'s discussion committee',
            ], 403);
        }

        // Validate committee has 2-3 members as per requirements
        if (count($committeeMembers) < 2 || count($committeeMembers) > 3) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid committee composition. Committee must have 2-3 members.',
            ], 400);
        }

        try {
            $student = \App\Models\User::findOrFail($validated['student_id']);
            
            // Check if grade is already approved (prevent updates after approval)
            $existingGrade = Grade::where('project_id', $project->id)
                ->where('student_id', $student->id)
                ->first();
            
            if ($existingGrade && $existingGrade->is_approved) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot update grade that has already been approved',
                ], 400);
            }

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
                $committeeMembers // Use derived committee members, not client-provided
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
}

