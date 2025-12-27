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
        $grades = Grade::where('student_id', $request->user()->id)
            ->with(['project', 'student'])
            ->get();

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

