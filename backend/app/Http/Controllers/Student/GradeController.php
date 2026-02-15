<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Resources\GradeResource;
use App\Models\Grade;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GradeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Grade::where('student_id', $request->user()->id)
            ->with(['project', 'student']);

        // UC-ST-08: Students can only view approved or published grades
        $query->where(function ($q) {
            $q->where('is_approved', true)
              ->orWhere('fd1_published', true)
              ->orWhere('fd2_published', true);
        });

        // Order by most recent grades first
        $grades = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => GradeResource::collection($grades),
        ]);
    }

    public function show(Grade $grade): JsonResponse
    {
        if ($grade->student_id !== request()->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => new GradeResource($grade->load(['project', 'student'])),
        ]);
    }
}

