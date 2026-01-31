<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Http\Traits\HasTableQuery;
use App\Models\Student;
use App\Models\Supervisor;
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
        $settingsService = app(\App\Services\SettingsService::class);
        $userFullNameMaxLength = $settingsService->getUserFullNameMaxLength();
        $emailMaxLength = $settingsService->getEmailMaxLength();
        $usernameMaxLength = $settingsService->getUsernameMaxLength();
        $passwordMinLength = $settingsService->getPasswordMinLength();

        $validated = $request->validate([
            'name' => "required|string|max:{$userFullNameMaxLength}",
            'email' => "nullable|string|email|max:{$emailMaxLength}|unique:users",
            'username' => "nullable|string|max:{$usernameMaxLength}|unique:users",
            'password' => "required|string|min:{$passwordMinLength}",
            'role' => 'required|in:student,supervisor,discussion_committee,projects_committee,admin',
            'student_id' => 'nullable|string|unique:students,student_id',
            'emp_id' => 'nullable|string|unique:supervisors,emp_id',
            'department' => 'nullable|string',
            'major' => 'nullable|string', // For students
            'academic_level' => 'nullable|string', // For students
            'phone' => 'nullable|string',
            'status' => 'sometimes|in:active,inactive,suspended',
        ]);

        // Derive username from profile identifiers if not explicitly provided
        $username = $validated['username'] ?? null;
        if (!$username) {
            if ($validated['role'] === 'student' && isset($validated['student_id'])) {
                $username = $validated['student_id'];
            } elseif (in_array($validated['role'], ['supervisor', 'discussion_committee', 'projects_committee']) && isset($validated['emp_id'])) {
                $username = $validated['emp_id'];
            } elseif ($validated['role'] === 'admin') {
                // For admin, check if username already exists, use 'admin', 'admin2', etc.
                $adminCount = User::where('role', 'admin')->count();
                $username = $adminCount === 0 ? 'admin' : 'admin' . ($adminCount + 1);
            } else {
                // Fallback: generate unique username
                $username = 'user_' . time() . '_' . rand(1000, 9999);
            }
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'] ?? null,
            'username' => $username,
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'phone' => $validated['phone'] ?? null,
            'status' => $validated['status'] ?? 'active',
        ]);

        // Create profile based on role
        if ($validated['role'] === 'student' && isset($validated['student_id'])) {
            Student::create([
                'user_id' => $user->id,
                'student_id' => $validated['student_id'],
                'major' => $validated['department'] ?? $validated['major'] ?? null,
                'academic_level' => $validated['academic_level'] ?? null,
            ]);
        } elseif (in_array($validated['role'], ['supervisor', 'discussion_committee', 'projects_committee']) && isset($validated['emp_id'])) {
            Supervisor::create([
                'user_id' => $user->id,
                'emp_id' => $validated['emp_id'],
                'department' => $validated['department'] ?? null,
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => new UserResource($user->load(['studentProfile', 'supervisorProfile'])),
            'message' => 'User created successfully',
        ], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $settingsService = app(\App\Services\SettingsService::class);
        $userFullNameMaxLength = $settingsService->getUserFullNameMaxLength();
        $emailMaxLength = $settingsService->getEmailMaxLength();
        $usernameMaxLength = $settingsService->getUsernameMaxLength();
        $passwordMinLength = $settingsService->getPasswordMinLength();

        $validated = $request->validate([
            'name' => "sometimes|string|max:{$userFullNameMaxLength}",
            'email' => "nullable|string|email|max:{$emailMaxLength}|unique:users,email," . $user->id,
            'username' => "nullable|string|max:{$usernameMaxLength}|unique:users,username," . $user->id,
            'password' => "sometimes|string|min:{$passwordMinLength}",
            'role' => 'sometimes|in:student,supervisor,discussion_committee,projects_committee,admin',
            'student_id' => 'nullable|string|unique:students,student_id,' . ($user->studentProfile?->id ?? 'NULL') . ',id',
            'emp_id' => 'nullable|string|unique:supervisors,emp_id,' . ($user->supervisorProfile?->id ?? 'NULL') . ',id',
            'department' => 'nullable|string',
            'major' => 'nullable|string', // For students
            'academic_level' => 'nullable|string', // For students
            'phone' => 'nullable|string',
            'status' => 'sometimes|in:active,inactive,suspended',
        ]);

        // Derive username if not explicitly provided and profile identifiers changed
        $username = $validated['username'] ?? null;
        if (!$username) {
            // Only update username if profile identifiers are being updated
            if (isset($validated['student_id']) && $user->role === 'student') {
                $username = $validated['student_id'];
            } elseif (isset($validated['emp_id']) && in_array($user->role, ['supervisor', 'discussion_committee', 'projects_committee'])) {
                $username = $validated['emp_id'];
            } else {
                // Keep existing username if not changing
                $username = $user->username;
            }
        }

        // Update user basic fields
        $userFields = ['name', 'email', 'username', 'password', 'role', 'phone', 'status'];
        $userData = array_intersect_key($validated, array_flip($userFields));
        $userData['username'] = $username;

        if (isset($userData['password'])) {
            $userData['password'] = Hash::make($userData['password']);
        }

        $user->update($userData);

        // Update or create profile
        if ($user->role === 'student') {
            if ($user->studentProfile) {
                $profileData = [];
                if (array_key_exists('student_id', $validated)) {
                    $profileData['student_id'] = $validated['student_id'] ?: null;
                }
                if (array_key_exists('department', $validated) || array_key_exists('major', $validated)) {
                    $profileData['major'] = $validated['department'] ?? $validated['major'] ?? null;
                }
                if (array_key_exists('academic_level', $validated)) {
                    $profileData['academic_level'] = $validated['academic_level'] ?: null;
                }
                if (!empty($profileData)) {
                    $user->studentProfile->update($profileData);
                }
            } elseif (isset($validated['student_id']) && !empty($validated['student_id'])) {
                Student::create([
                    'user_id' => $user->id,
                    'student_id' => $validated['student_id'],
                    'major' => $validated['department'] ?? $validated['major'] ?? null,
                    'academic_level' => $validated['academic_level'] ?? null,
                ]);
            }
        } elseif (in_array($user->role, ['supervisor', 'discussion_committee', 'projects_committee'])) {
            if ($user->supervisorProfile) {
                $profileData = [];
                if (array_key_exists('emp_id', $validated)) {
                    $profileData['emp_id'] = $validated['emp_id'] ?: null;
                }
                if (array_key_exists('department', $validated)) {
                    $profileData['department'] = $validated['department'] ?: null;
                }
                if (!empty($profileData)) {
                    $user->supervisorProfile->update($profileData);
                }
            } elseif (isset($validated['emp_id']) && !empty($validated['emp_id'])) {
                Supervisor::create([
                    'user_id' => $user->id,
                    'emp_id' => $validated['emp_id'],
                    'department' => $validated['department'] ?? null,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'data' => new UserResource($user->fresh()->load(['studentProfile', 'supervisorProfile'])),
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
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('username', 'like', "%{$search}%");
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

