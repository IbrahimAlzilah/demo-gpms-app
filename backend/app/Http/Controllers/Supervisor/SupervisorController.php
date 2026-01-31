<?php

namespace App\Http\Controllers\Supervisor;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupervisorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $supervisors = User::where('role', 'supervisor')
            ->where('status', 'active')
            ->orderBy('name', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => UserResource::collection($supervisors),
        ]);
    }
}
