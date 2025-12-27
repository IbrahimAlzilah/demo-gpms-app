<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Health check endpoint
Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'message' => 'API is running',
        'data' => [
            'timestamp' => now()->toISOString(),
            'database' => \DB::connection()->getPdo() ? 'connected' : 'disconnected',
        ],
    ]);
});

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('/login', [App\Http\Controllers\AuthController::class, 'login']);
    Route::post('/register', [App\Http\Controllers\AuthController::class, 'register']);
    Route::post('/recover-password', [App\Http\Controllers\AuthController::class, 'recoverPassword']);
    Route::post('/reset-password', [App\Http\Controllers\AuthController::class, 'resetPassword']);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::get('/me', [App\Http\Controllers\AuthController::class, 'me']);
        Route::post('/logout', [App\Http\Controllers\AuthController::class, 'logout']);
    });

    // Student routes
    Route::prefix('student')->middleware('role:student')->group(function () {
        Route::apiResource('proposals', App\Http\Controllers\Student\ProposalController::class);
        Route::apiResource('projects', App\Http\Controllers\Student\ProjectController::class);
        Route::post('projects/{project}/register', [App\Http\Controllers\Student\ProjectController::class, 'register']);
        Route::get('projects/registrations', [App\Http\Controllers\Student\ProjectController::class, 'getRegistrations']);
        Route::delete('projects/registrations/{registration}', [App\Http\Controllers\Student\ProjectController::class, 'cancelRegistration']);
        Route::get('groups', [App\Http\Controllers\Student\GroupController::class, 'show']);
        Route::post('groups', [App\Http\Controllers\Student\GroupController::class, 'create']);
        Route::post('groups/invite', [App\Http\Controllers\Student\GroupController::class, 'invite']);
        Route::get('groups/invitations', [App\Http\Controllers\Student\GroupController::class, 'getInvitations']);
        Route::post('groups/invitations/{invitation}/accept', [App\Http\Controllers\Student\GroupController::class, 'acceptInvitation']);
        Route::post('groups/invitations/{invitation}/reject', [App\Http\Controllers\Student\GroupController::class, 'rejectInvitation']);
        Route::post('groups/{group}/join', [App\Http\Controllers\Student\GroupController::class, 'joinGroup']);
        Route::put('groups/{group}/leader', [App\Http\Controllers\Student\GroupController::class, 'updateLeader']);
        Route::post('groups/{group}/members', [App\Http\Controllers\Student\GroupController::class, 'addMember']);
        Route::delete('groups/{group}/members/{member}', [App\Http\Controllers\Student\GroupController::class, 'removeMember']);
        Route::apiResource('documents', App\Http\Controllers\Student\DocumentController::class);
        Route::apiResource('requests', App\Http\Controllers\Student\RequestController::class);
        Route::post('requests/{request}/cancel', [App\Http\Controllers\Student\RequestController::class, 'cancel']);
        Route::get('grades', [App\Http\Controllers\Student\GradeController::class, 'index']);
        Route::get('grades/{id}', [App\Http\Controllers\Student\GradeController::class, 'show']);
    });

    // Supervisor routes
    Route::prefix('supervisor')->middleware('role:supervisor')->group(function () {
        Route::get('projects', [App\Http\Controllers\Supervisor\ProjectController::class, 'index']);
        Route::get('projects/{id}', [App\Http\Controllers\Supervisor\ProjectController::class, 'show']);
        Route::apiResource('supervision-requests', App\Http\Controllers\Supervisor\SupervisionController::class);
        Route::post('supervision-requests/{request}/approve', [App\Http\Controllers\Supervisor\SupervisionController::class, 'approve']);
        Route::post('supervision-requests/{request}/reject', [App\Http\Controllers\Supervisor\SupervisionController::class, 'reject']);
        // Custom evaluation routes (before apiResource to match frontend expectations)
        Route::get('evaluations', [App\Http\Controllers\Supervisor\EvaluationController::class, 'index']);
        Route::post('evaluations', [App\Http\Controllers\Supervisor\EvaluationController::class, 'store']);
        Route::apiResource('notes', App\Http\Controllers\Supervisor\NoteController::class);
    });

    // Projects Committee routes
    Route::prefix('projects-committee')->middleware('role:projects_committee')->group(function () {
        // Custom proposal routes (must be before apiResource to match correctly)
        Route::post('proposals/{proposal}/approve', [App\Http\Controllers\ProjectsCommittee\ProposalController::class, 'approve']);
        Route::post('proposals/{proposal}/reject', [App\Http\Controllers\ProjectsCommittee\ProposalController::class, 'reject']);
        Route::post('proposals/{proposal}/request-modification', [App\Http\Controllers\ProjectsCommittee\ProposalController::class, 'requestModification']);
        Route::apiResource('proposals', App\Http\Controllers\ProjectsCommittee\ProposalController::class);
        Route::apiResource('projects', App\Http\Controllers\ProjectsCommittee\ProjectController::class);
        Route::post('projects/announce', [App\Http\Controllers\ProjectsCommittee\ProjectController::class, 'announce']);
        Route::apiResource('periods', App\Http\Controllers\ProjectsCommittee\PeriodController::class);
        Route::get('supervisors', [App\Http\Controllers\ProjectsCommittee\SupervisorController::class, 'index']);
        Route::post('supervisors/assign', [App\Http\Controllers\ProjectsCommittee\SupervisorController::class, 'assign']);
        Route::apiResource('requests', App\Http\Controllers\ProjectsCommittee\RequestController::class);
        Route::post('committees/distribute', [App\Http\Controllers\ProjectsCommittee\CommitteeController::class, 'distribute']);
        Route::get('committees/members', [App\Http\Controllers\ProjectsCommittee\CommitteeController::class, 'members']);
        Route::get('reports', [App\Http\Controllers\ProjectsCommittee\ReportController::class, 'index']);
    });

    // Discussion Committee routes
    Route::prefix('discussion-committee')->middleware('role:discussion_committee')->group(function () {
        Route::get('projects', [App\Http\Controllers\DiscussionCommittee\ProjectController::class, 'index']);
        Route::get('projects/{id}', [App\Http\Controllers\DiscussionCommittee\ProjectController::class, 'show']);
        // Custom evaluation routes (before apiResource to match frontend expectations)
        Route::get('evaluations', [App\Http\Controllers\DiscussionCommittee\EvaluationController::class, 'index']);
        Route::post('evaluations', [App\Http\Controllers\DiscussionCommittee\EvaluationController::class, 'store']);
    });

    // Admin routes
    Route::prefix('admin')->middleware('role:admin')->group(function () {
        Route::apiResource('users', App\Http\Controllers\Admin\UserController::class);
        Route::get('reports', [App\Http\Controllers\Admin\ReportController::class, 'index']);
    });
});

