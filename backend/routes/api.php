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

    // Time Windows routes (available to all authenticated users)
    Route::prefix('time-windows')->group(function () {
        Route::get('/active', [App\Http\Controllers\TimeWindowController::class, 'activeWindows']);
        Route::get('/upcoming', [App\Http\Controllers\TimeWindowController::class, 'upcomingWindows']);
        Route::post('/check', [App\Http\Controllers\TimeWindowController::class, 'checkWindow']);
        Route::post('/status', [App\Http\Controllers\TimeWindowController::class, 'windowsStatus']);
        Route::get('/types', [App\Http\Controllers\TimeWindowController::class, 'windowTypes']);
    });

    // Student routes
    Route::prefix('student')->middleware('role:student')->group(function () {
        Route::get('dashboard', [App\Http\Controllers\Student\DashboardController::class, 'index']);
        // Proposals routes - time window check is handled in controller (allows proposal_submission OR project_registration)
        // Batch routes must be defined before individual routes to avoid conflicts
        Route::post('proposals/batch', [App\Http\Controllers\Student\ProposalController::class, 'batchSubmit']);
        Route::put('proposals/batch', [App\Http\Controllers\Student\ProposalController::class, 'batchUpdate']);
        Route::get('proposals/submission', [App\Http\Controllers\Student\ProposalController::class, 'getSubmissionContext']);
        Route::get('proposals', [App\Http\Controllers\Student\ProposalController::class, 'index']);
        Route::get('proposals/{proposal}', [App\Http\Controllers\Student\ProposalController::class, 'show']);
        Route::post('proposals', [App\Http\Controllers\Student\ProposalController::class, 'store']);
        Route::put('proposals/{proposal}', [App\Http\Controllers\Student\ProposalController::class, 'update']);
        Route::delete('proposals/{proposal}', [App\Http\Controllers\Student\ProposalController::class, 'destroy']);
        // Supervisors
        Route::get('supervisors', [App\Http\Controllers\Student\SupervisorController::class, 'index']);

        // Project registration routes must be defined before apiResource to prevent route conflicts
        Route::get('projects/registrations', [App\Http\Controllers\Student\ProjectController::class, 'getRegistrations']);
        Route::delete('projects/registrations/{registration}', [App\Http\Controllers\Student\ProjectController::class, 'cancelRegistration']);
        
        Route::apiResource('projects', App\Http\Controllers\Student\ProjectController::class);
        Route::post('projects/{project}/register', [App\Http\Controllers\Student\ProjectController::class, 'register'])
            ->middleware('window:project_registration');
        Route::get('projects/{project}/notes', [App\Http\Controllers\Student\ProjectController::class, 'getSupervisorNotes']);
        Route::post('projects/{project}/notes/{note}/reply', [App\Http\Controllers\Student\ProjectController::class, 'replyToNote']);
        Route::get('projects/{project}/milestones', [App\Http\Controllers\Student\ProjectController::class, 'getMilestones']);
        Route::get('projects/{project}/meetings', [App\Http\Controllers\Student\ProjectController::class, 'getMeetings']);
        Route::get('projects/{project}/progress', [App\Http\Controllers\Student\ProjectController::class, 'getProgress']);
        Route::get('groups', [App\Http\Controllers\Student\StudentGroupController::class, 'show']);
        Route::get('groups/lookup', [App\Http\Controllers\Student\StudentGroupController::class, 'findByCode']);
        Route::post('groups', [App\Http\Controllers\Student\StudentGroupController::class, 'create']);
        Route::post('groups/invite', [App\Http\Controllers\Student\StudentGroupController::class, 'invite']);
        Route::get('groups/invitations', [App\Http\Controllers\Student\StudentGroupController::class, 'getInvitations']);
        Route::post('groups/invitations/{invitation}/accept', [App\Http\Controllers\Student\StudentGroupController::class, 'acceptInvitation']);
        Route::post('groups/invitations/{invitation}/reject', [App\Http\Controllers\Student\StudentGroupController::class, 'rejectInvitation']);
        Route::put('groups/{group}/leader', [App\Http\Controllers\Student\StudentGroupController::class, 'updateLeader']);
        Route::post('groups/{group}/members', [App\Http\Controllers\Student\StudentGroupController::class, 'addMember']);
        Route::delete('groups/{group}/members/{member}', [App\Http\Controllers\Student\StudentGroupController::class, 'removeMember']);
        Route::delete('groups/{group}/leave', [App\Http\Controllers\Student\StudentGroupController::class, 'leave']);
        Route::delete('groups/{group}', [App\Http\Controllers\Student\StudentGroupController::class, 'destroy']);
        // Join requests routes
        Route::post('groups/join-request', [App\Http\Controllers\Student\StudentGroupController::class, 'createJoinRequest']);
        Route::get('groups/{group}/join-requests', [App\Http\Controllers\Student\StudentGroupController::class, 'getJoinRequests']);
        Route::post('groups/join-requests/{joinRequest}/approve', [App\Http\Controllers\Student\StudentGroupController::class, 'approveJoinRequest']);
        Route::post('groups/join-requests/{joinRequest}/reject', [App\Http\Controllers\Student\StudentGroupController::class, 'rejectJoinRequest']);
        Route::get('documents/{document}/download', [App\Http\Controllers\Student\DocumentController::class, 'download']);
        Route::post('documents', [App\Http\Controllers\Student\DocumentController::class, 'store'])
            ->middleware('window:deliverable_submission');
        Route::get('documents', [App\Http\Controllers\Student\DocumentController::class, 'index']);
        Route::get('documents/{document}', [App\Http\Controllers\Student\DocumentController::class, 'show']);
        Route::delete('documents/{document}', [App\Http\Controllers\Student\DocumentController::class, 'destroy']);
        Route::apiResource('requests', App\Http\Controllers\Student\RequestController::class);
        Route::post('requests/{request}/cancel', [App\Http\Controllers\Student\RequestController::class, 'cancel']);
        Route::get('grades', [App\Http\Controllers\Student\GradeController::class, 'index']);
        Route::get('grades/{id}', [App\Http\Controllers\Student\GradeController::class, 'show']);
    });

    // Supervisor routes
    Route::prefix('supervisor')->middleware('role:supervisor')->group(function () {
        Route::get('dashboard', [App\Http\Controllers\Supervisor\DashboardController::class, 'index']);
        // Proposals with time window check
        Route::get('proposals', [App\Http\Controllers\Supervisor\ProposalController::class, 'index']);
        Route::get('proposals/{proposal}', [App\Http\Controllers\Supervisor\ProposalController::class, 'show']);
        Route::post('proposals', [App\Http\Controllers\Supervisor\ProposalController::class, 'store'])
            ->middleware('window:proposal_submission');
        Route::put('proposals/{proposal}', [App\Http\Controllers\Supervisor\ProposalController::class, 'update'])
            ->middleware('window:proposal_submission');
        Route::delete('proposals/{proposal}', [App\Http\Controllers\Supervisor\ProposalController::class, 'destroy']);
        // Supervisors
        Route::get('supervisors', [App\Http\Controllers\Supervisor\SupervisorController::class, 'index']);
        Route::get('projects', [App\Http\Controllers\Supervisor\ProjectController::class, 'index']);
        Route::get('projects/{project}', [App\Http\Controllers\Supervisor\ProjectController::class, 'show']);
        Route::get('projects/{project}/progress', [App\Http\Controllers\Supervisor\ProjectController::class, 'getProgress']);
        Route::get('projects/{project}/grades', [App\Http\Controllers\Supervisor\ProjectController::class, 'getGrades']);
        // Document routes
        Route::post('projects/{project}/documents/{document}/review', [App\Http\Controllers\Supervisor\DocumentController::class, 'review']);
        Route::get('projects/{project}/documents/{document}/download', [App\Http\Controllers\Supervisor\DocumentController::class, 'download']);
        Route::get('supervision-requests', [App\Http\Controllers\Supervisor\SupervisionController::class, 'index']);
        Route::post('supervision-requests/{project}/approve', [App\Http\Controllers\Supervisor\SupervisionController::class, 'approve']);
        Route::post('supervision-requests/{project}/reject', [App\Http\Controllers\Supervisor\SupervisionController::class, 'reject']);
        // New assignment request routes
        Route::get('assignment-requests', [App\Http\Controllers\Supervisor\SupervisionController::class, 'listAssignmentRequests']);
        Route::post('assignment-requests/{assignmentRequest}/approve', [App\Http\Controllers\Supervisor\SupervisionController::class, 'approveAssignmentRequest']);
        Route::post('assignment-requests/{assignmentRequest}/reject', [App\Http\Controllers\Supervisor\SupervisionController::class, 'rejectAssignmentRequest']);
        // Custom evaluation routes (before apiResource to match frontend expectations)
        // Note: Supervisor grading is NOT restricted by time windows per specifications
        Route::get('evaluations', [App\Http\Controllers\Supervisor\EvaluationController::class, 'index']);
        Route::post('evaluations', [App\Http\Controllers\Supervisor\EvaluationController::class, 'store']);
        // Notes routes - custom routes to match frontend expectations (project-based)
        Route::get('projects/{project}/notes', [App\Http\Controllers\Supervisor\NoteController::class, 'index']);
        Route::post('projects/{project}/notes', [App\Http\Controllers\Supervisor\NoteController::class, 'store']);
        Route::post('notes/{note}/reply', [App\Http\Controllers\Supervisor\NoteController::class, 'addReply']);
        // Milestones routes
        Route::get('projects/{project}/milestones', [App\Http\Controllers\Supervisor\MilestoneController::class, 'index']);
        Route::post('projects/{project}/milestones', [App\Http\Controllers\Supervisor\MilestoneController::class, 'store']);
        Route::put('milestones/{milestone}', [App\Http\Controllers\Supervisor\MilestoneController::class, 'update']);
        Route::delete('milestones/{milestone}', [App\Http\Controllers\Supervisor\MilestoneController::class, 'destroy']);
        Route::post('milestones/{milestone}/complete', [App\Http\Controllers\Supervisor\MilestoneController::class, 'markCompleted']);
        // Meetings routes
        Route::get('projects/{project}/meetings', [App\Http\Controllers\Supervisor\MeetingController::class, 'index']);
        Route::post('projects/{project}/meetings', [App\Http\Controllers\Supervisor\MeetingController::class, 'store']);
        Route::put('meetings/{meeting}', [App\Http\Controllers\Supervisor\MeetingController::class, 'update']);
        Route::delete('meetings/{meeting}', [App\Http\Controllers\Supervisor\MeetingController::class, 'destroy']);
    });

    // Projects Committee routes
    Route::prefix('projects-committee')->middleware('role:projects_committee')->group(function () {
        Route::get('dashboard', [App\Http\Controllers\ProjectsCommittee\DashboardController::class, 'index']);
        // Custom proposal routes (must be before apiResource to match correctly)
        Route::post('proposals/{proposal}/approve', [App\Http\Controllers\ProjectsCommittee\ProposalController::class, 'approve']);
        Route::post('proposals/{proposal}/reject', [App\Http\Controllers\ProjectsCommittee\ProposalController::class, 'reject']);
        Route::post('proposals/{proposal}/request-modification', [App\Http\Controllers\ProjectsCommittee\ProposalController::class, 'requestModification']);
        Route::get('proposals/students/search', [App\Http\Controllers\ProjectsCommittee\ProposalController::class, 'searchStudents']);
        // apiResource automatically includes POST /proposals for store() method
        Route::apiResource('proposals', App\Http\Controllers\ProjectsCommittee\ProposalController::class);
        Route::apiResource('projects', App\Http\Controllers\ProjectsCommittee\ProjectController::class);
        Route::post('projects/announce', [App\Http\Controllers\ProjectsCommittee\ProjectController::class, 'announce']);
        Route::post('projects/unannounce', [App\Http\Controllers\ProjectsCommittee\ProjectController::class, 'unannounce']);
        Route::apiResource('periods', App\Http\Controllers\ProjectsCommittee\PeriodController::class);
        Route::get('supervisors', [App\Http\Controllers\ProjectsCommittee\SupervisorController::class, 'index']);
        Route::post('supervisors/assign', [App\Http\Controllers\ProjectsCommittee\SupervisorController::class, 'assign']);
        Route::post('supervisors/request-assignment', [App\Http\Controllers\ProjectsCommittee\SupervisorController::class, 'requestAssignment']);
        Route::get('supervisors/assignment-requests', [App\Http\Controllers\ProjectsCommittee\SupervisorController::class, 'listRequests']);
        Route::get('supervisors/assignment-requests/{request}', [App\Http\Controllers\ProjectsCommittee\SupervisorController::class, 'showRequest']);
        Route::delete('supervisors/assignment-requests/{assignmentRequest}', [App\Http\Controllers\ProjectsCommittee\SupervisorController::class, 'cancelRequest']);
        // Custom request routes (must be before apiResource to match correctly)
        Route::post('requests/{projectRequest}/approve', [App\Http\Controllers\ProjectsCommittee\RequestController::class, 'approve']);
        Route::post('requests/{projectRequest}/reject', [App\Http\Controllers\ProjectsCommittee\RequestController::class, 'reject']);
        Route::apiResource('requests', App\Http\Controllers\ProjectsCommittee\RequestController::class);
        Route::get('registrations', [App\Http\Controllers\ProjectsCommittee\RegistrationController::class, 'index']);
        Route::get('registrations/groups', [App\Http\Controllers\ProjectsCommittee\RegistrationController::class, 'groups']);
        Route::get('registrations/{registration}', [App\Http\Controllers\ProjectsCommittee\RegistrationController::class, 'show']);
        Route::post('registrations', [App\Http\Controllers\ProjectsCommittee\RegistrationController::class, 'store']);
        Route::post('registrations/{registration}/approve', [App\Http\Controllers\ProjectsCommittee\RegistrationController::class, 'approve']);
        Route::post('registrations/{registration}/reject', [App\Http\Controllers\ProjectsCommittee\RegistrationController::class, 'reject']);
        Route::post('committees/distribute', [App\Http\Controllers\ProjectsCommittee\CommitteeController::class, 'distribute']);
        Route::get('committees/members', [App\Http\Controllers\ProjectsCommittee\CommitteeController::class, 'members']);
        Route::get('grades', [App\Http\Controllers\ProjectsCommittee\GradeController::class, 'index']);
        Route::get('grades/{grade}', [App\Http\Controllers\ProjectsCommittee\GradeController::class, 'show']);
        Route::post('grades/{grade}/approve', [App\Http\Controllers\ProjectsCommittee\GradeController::class, 'approve'])
            ->middleware('window:grade_approval');
        Route::get('reports', [App\Http\Controllers\ProjectsCommittee\ReportController::class, 'index']);
        Route::get('reports/overview', [App\Http\Controllers\ProjectsCommittee\ReportController::class, 'overview']);
        Route::get('reports/projects', [App\Http\Controllers\ProjectsCommittee\ReportController::class, 'projects']);
        Route::get('reports/supervisors', [App\Http\Controllers\ProjectsCommittee\ReportController::class, 'supervisors']);
        Route::get('reports/students', [App\Http\Controllers\ProjectsCommittee\ReportController::class, 'students']);
        Route::get('reports/requests', [App\Http\Controllers\ProjectsCommittee\ReportController::class, 'requests']);
        Route::get('reports/deadlines', [App\Http\Controllers\ProjectsCommittee\ReportController::class, 'deadlines']);
        Route::get('reports/history', [App\Http\Controllers\ProjectsCommittee\ReportController::class, 'history']);
        Route::get('reports/export/pdf', [App\Http\Controllers\ProjectsCommittee\ReportExportController::class, 'pdf']);
        Route::get('reports/export/excel', [App\Http\Controllers\ProjectsCommittee\ReportExportController::class, 'excel']);
    });

    // Discussion Committee routes
    Route::prefix('discussion-committee')->middleware('role:discussion_committee')->group(function () {
        Route::get('dashboard', [App\Http\Controllers\DiscussionCommittee\DashboardController::class, 'index']);
        Route::get('projects', [App\Http\Controllers\DiscussionCommittee\ProjectController::class, 'index']);
        Route::get('projects/{project}', [App\Http\Controllers\DiscussionCommittee\ProjectController::class, 'show']);
        // Custom evaluation routes (before apiResource to match frontend expectations)
        Route::get('evaluations', [App\Http\Controllers\DiscussionCommittee\EvaluationController::class, 'index']);
        Route::post('evaluations', [App\Http\Controllers\DiscussionCommittee\EvaluationController::class, 'store'])
            ->middleware('window:discussion_evaluation');
    });

    // Admin routes
    Route::prefix('admin')->middleware('role:admin')->group(function () {
        Route::get('dashboard', [App\Http\Controllers\Admin\DashboardController::class, 'index']);
        Route::apiResource('users', App\Http\Controllers\Admin\UserController::class);
        Route::get('reports', [App\Http\Controllers\Admin\ReportController::class, 'index']);
    });

    // Notifications routes (available to all authenticated users)
    Route::prefix('notifications')->group(function () {
        Route::get('/', [App\Http\Controllers\NotificationController::class, 'index']);
        Route::get('/unread-count', [App\Http\Controllers\NotificationController::class, 'unreadCount']);
        Route::post('/{id}/read', [App\Http\Controllers\NotificationController::class, 'markAsRead']);
        Route::post('/read-all', [App\Http\Controllers\NotificationController::class, 'markAllAsRead']);
        Route::delete('/', [App\Http\Controllers\NotificationController::class, 'deleteAll']);
        Route::delete('/{id}', [App\Http\Controllers\NotificationController::class, 'destroy']);
    });
});

