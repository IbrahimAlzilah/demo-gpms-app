<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Http\Traits\HasTableQuery;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    use HasTableQuery;

    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        $query = $this->applyTableQuery($query, $request);

        return response()->json($this->getPaginatedResponse($query, $request, UserResource::class));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:student,supervisor,discussion_committee,projects_committee,admin',
            'student_id' => 'nullable|string|unique:users',
            'emp_id' => 'nullable|string|unique:users',
            'department' => 'nullable|string',
            'phone' => 'nullable|string',
            'status' => 'sometimes|in:active,inactive,suspended',
        ]);

        $user = User::create([
            ...$validated,
            'password' => Hash::make($validated['password']),
            'status' => $validated['status'] ?? 'active',
        ]);

        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
            'message' => 'User created successfully',
        ], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'sometimes|string|min:8',
            'role' => 'sometimes|in:student,supervisor,discussion_committee,projects_committee,admin',
            'student_id' => 'nullable|string|unique:users,student_id,' . $user->id,
            'emp_id' => 'nullable|string|unique:users,emp_id,' . $user->id,
            'department' => 'nullable|string',
            'phone' => 'nullable|string',
            'status' => 'sometimes|in:active,inactive,suspended',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'success' => true,
            'data' => new UserResource($user->fresh()),
            'message' => 'User updated successfully',
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully',
        ]);
    }

    protected function applySearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%");
        });
    }

    protected function applyFilters($query, array $filters)
    {
        if (isset($filters['role'])) {
            $query->where('role', $filters['role']);
        }
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        return $query;
    }
}

