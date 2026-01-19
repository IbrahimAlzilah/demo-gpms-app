<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\Student;
use App\Models\Supervisor;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login user and return token
     */
    public function login(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'identifier' => 'required|string',
                'password' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $identifier = trim($request->identifier);
            
            // Find user by username
            $user = User::where('username', $identifier)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials',
                ], 401);
            }

            if ($user->status !== 'active') {
                return response()->json([
                    'success' => false,
                    'message' => 'Account is not active',
                ], 403);
            }

            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'data' => [
                    'token' => $token,
                    'user' => new UserResource($user),
                    'permissions' => $this->getPermissions($user->role),
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Login error: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred during login. Please try again later.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Register a new user
     */
    public function register(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'nullable|string|email|max:255|unique:users',
                'username' => 'nullable|string|max:255|unique:users',
                'password' => 'required|string|min:8|confirmed',
                'role' => 'required|in:student,supervisor,discussion_committee,projects_committee,admin',
                'student_id' => 'nullable|string|unique:students,student_id',
                'emp_id' => 'nullable|string|unique:supervisors,emp_id',
                'department' => 'nullable|string',
                'major' => 'nullable|string', // For students
                'academic_level' => 'nullable|string', // For students
                'phone' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Derive username from profile identifiers if not explicitly provided
            $username = $request->username;
            if (!$username) {
                if ($request->role === 'student' && $request->student_id) {
                    $username = $request->student_id;
                } elseif (in_array($request->role, ['supervisor', 'discussion_committee', 'projects_committee']) && $request->emp_id) {
                    $username = $request->emp_id;
                } elseif ($request->role === 'admin') {
                    // For admin, check if username already exists, use 'admin', 'admin2', etc.
                    $adminCount = User::where('role', 'admin')->count();
                    $username = $adminCount === 0 ? 'admin' : 'admin' . ($adminCount + 1);
                } else {
                    // Fallback: generate unique username
                    $username = 'user_' . time() . '_' . rand(1000, 9999);
                }
            }

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'username' => $username,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'phone' => $request->phone,
                'status' => 'active',
            ]);

            // Create profile based on role
            if ($request->role === 'student' && $request->student_id) {
                Student::create([
                    'user_id' => $user->id,
                    'student_id' => $request->student_id,
                    'major' => $request->department ?? $request->major,
                    'academic_level' => $request->academic_level,
                ]);
            } elseif (in_array($request->role, ['supervisor', 'discussion_committee', 'projects_committee']) && $request->emp_id) {
                Supervisor::create([
                    'user_id' => $user->id,
                    'emp_id' => $request->emp_id,
                    'department' => $request->department,
                ]);
            }

            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'data' => [
                    'token' => $token,
                    'user' => new UserResource($user->load(['studentProfile', 'supervisorProfile'])),
                    'permissions' => $this->getPermissions($user->role),
                ],
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Registration error: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred during registration. Please try again later.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => [
                'user' => new UserResource($user),
                'permissions' => $this->getPermissions($user->role),
            ],
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Request password recovery
     */
    public function recoverPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json([
                'success' => true,
                'message' => 'Password reset link sent to your email',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Unable to send password reset link',
        ], 400);
    }

    /**
     * Reset password
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'success' => true,
                'message' => 'Password reset successfully',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Unable to reset password',
        ], 400);
    }

    /**
     * Get permissions for a role
     */
    private function getPermissions(string $role): array
    {
        $permissions = [
            'student' => [
                'view_proposals',
                'create_proposals',
                'view_projects',
                'register_projects',
                'manage_groups',
                'upload_documents',
                'create_requests',
                'view_grades',
            ],
            'supervisor' => [
                'view_projects',
                'approve_requests',
                'review_documents',
                'submit_grades',
                'add_notes',
                'monitor_projects',
            ],
            'discussion_committee' => [
                'view_assigned_projects',
                'submit_final_grades',
                'add_evaluation_notes',
            ],
            'projects_committee' => [
                'review_proposals',
                'manage_projects',
                'manage_periods',
                'assign_supervisors',
                'process_requests',
                'distribute_committees',
                'generate_reports',
            ],
            'admin' => [
                'manage_users',
                'view_all_data',
                'generate_reports',
                'system_configuration',
            ],
        ];

        return $permissions[$role] ?? [];
    }
}

