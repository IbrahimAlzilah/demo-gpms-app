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

    // System settings (read-only for display; any authenticated user)
    Route::get('settings', [App\Http\Controllers\SettingsController::class, 'index']);

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
        // Only batch (grouped) registration is supported
        Route::get('projects/registrations', [App\Http\Controllers\Student\ProjectController::class, 'getRegistrations']);
        Route::get('projects/registration-request', [App\Http\Controllers\Student\ProjectController::class, 'getGroupRegistrationRequest']);
        Route::delete('projects/registrations/{registration}', [App\Http\Controllers\Student\ProjectController::class, 'cancelRegistration']);
        Route::post('projects/batch-register', [App\Http\Controllers\Student\ProjectController::class, 'batchRegister'])
            ->middleware('window:project_registration');
        // Single project registration route (for backward compatibility or single project registration)
        Route::post('projects/{project}/register', [App\Http\Controllers\Student\ProjectController::class, 'register'])
            ->middleware('window:project_registration');

        Route::apiResource('projects', App\Http\Controllers\Student\ProjectController::class);
        Route::get('projects/{project}/notes', [App\Http\Controllers\Student\ProjectController::class, 'getSupervisorNotes']);
        Route::post('projects/{project}/notes/{note}/reply', [App\Http\Controllers\Student\ProjectController::class, 'replyToNote']);
        Route::get('projects/{project}/milestones', [App\Http\Controllers\Student\ProjectController::class, 'getMilestones']);
        Route::get('projects/{project}/meetings', [App\Http\Controllers\Student\ProjectController::class, 'getMeetings']);
        Route::get('projects/{project}/progress', [App\Http\Controllers\Student\ProjectController::class, 'getProgress']);
        Route::get('groups', [App\Http\Controllers\Student\StudentGroupController::class, 'show']);
        Route::get('groups/lookup', [App\Http\Controllers\Student\StudentGroupController::class, 'findByCode']);
        Route::get('groups/students/search', [App\Http\Controllers\Student\StudentGroupController::class, 'searchStudentsForInvite']);
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
        Route::get('groups/join-requests/my', [App\Http\Controllers\Student\StudentGroupController::class, 'getMyJoinRequests']);
        Route::get('groups/{group}/join-requests', [App\Http\Controllers\Student\StudentGroupController::class, 'getJoinRequests']);
        Route::post('groups/join-requests/{joinRequest}/approve', [App\Http\Controllers\Student\StudentGroupController::class, 'approveJoinRequest']);
        Route::post('groups/join-requests/{joinRequest}/reject', [App\Http\Controllers\Student\StudentGroupController::class, 'rejectJoinRequest']);
        Route::delete('groups/join-requests/{joinRequest}/cancel', [App\Http\Controllers\Student\StudentGroupController::class, 'cancelJoinRequest']);
        Route::get('documents/{document}/download', [App\Http\Controllers\Student\DocumentController::class, 'download']);
        Route::post('documents', [App\Http\Controllers\Student\DocumentController::class, 'store'])
            ->middleware('window:chapter_submission_phase_1,chapter_submission_phase_2,final_project_document_submission');
        Route::get('documents', [App\Http\Controllers\Student\DocumentController::class, 'index']);
        Route::get('documents/{document}', [App\Http\Controllers\Student\DocumentController::class, 'show']);
        Route::delete('documents/{document}', [App\Http\Controllers\Student\DocumentController::class, 'destroy']);
        Route::get('requests/context', [App\Http\Controllers\Student\RequestController::class, 'context']);
        Route::apiResource('requests', App\Http\Controllers\Student\RequestController::class);
        Route::post('requests/{request}/cancel', [App\Http\Controllers\Student\RequestController::class, 'cancel']);
        Route::get('grades', [App\Http\Controllers\Student\GradeController::class, 'index']);
        Route::get('grades/{id}', [App\Http\Controllers\Student\GradeController::class, 'show']);
    });

    // Supervisor routes
    Route::prefix('supervisor')->middleware('role:supervisor')->group(function () {
        Route::get('dashboard', [App\Http\Controllers\Supervisor\DashboardController::class, 'index']);
        // Proposals with time window check
        // IMPORTANT: More specific routes must be defined BEFORE parameterized routes
        Route::get('proposals', [App\Http\Controllers\Supervisor\ProposalController::class, 'index']);
        Route::get('proposals/submission', [App\Http\Controllers\Supervisor\ProposalController::class, 'getSubmissionContext']);
        Route::get('proposals/student-groups', [App\Http\Controllers\Supervisor\ProposalController::class, 'getStudentGroups']);
        Route::post('proposals/batch', [App\Http\Controllers\Supervisor\ProposalController::class, 'batchSubmit'])
            ->middleware('window:proposal_submission');
        Route::put('proposals/batch', [App\Http\Controllers\Supervisor\ProposalController::class, 'batchUpdate']);
        Route::get('proposals/{proposal}', [App\Http\Controllers\Supervisor\ProposalController::class, 'show']);
        Route::post('proposals/{proposal}/assign', [App\Http\Controllers\Supervisor\ProposalController::class, 'assignToGroup']);
        Route::post('proposals/{proposal}/request-assignment', [App\Http\Controllers\Supervisor\ProposalController::class, 'requestAssignment']);
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
        // Student change_supervisor requests (approve/reject by current supervisor)
        Route::get('student-requests', [App\Http\Controllers\Supervisor\StudentRequestController::class, 'index']);
        Route::post('student-requests/{projectRequest}/approve', [App\Http\Controllers\Supervisor\StudentRequestController::class, 'approve']);
        Route::post('student-requests/{projectRequest}/reject', [App\Http\Controllers\Supervisor\StudentRequestController::class, 'reject']);
        // New assignment request routes
        Route::get('assignment-requests', [App\Http\Controllers\Supervisor\SupervisionController::class, 'listAssignmentRequests']);
        Route::post('assignment-requests/{assignmentRequest}/approve', [App\Http\Controllers\Supervisor\SupervisionController::class, 'approveAssignmentRequest']);
        Route::post('assignment-requests/{assignmentRequest}/reject', [App\Http\Controllers\Supervisor\SupervisionController::class, 'rejectAssignmentRequest']);
        // Custom evaluation routes (before apiResource to match frontend expectations)
        // Note: Supervisor grading is NOT restricted by time windows per specifications
        Route::get('evaluations', [App\Http\Controllers\Supervisor\EvaluationController::class, 'index']);
        Route::post('evaluations', [App\Http\Controllers\Supervisor\EvaluationController::class, 'store']);
        Route::post('evaluations/batch', [App\Http\Controllers\Supervisor\EvaluationController::class, 'batchStore']);
        Route::get('evaluations/locked/{project}', [App\Http\Controllers\Supervisor\EvaluationController::class, 'isLocked']);
        // Defense Evaluation routes (FD1 & FD2)
        Route::get('defense-evaluations', [App\Http\Controllers\Supervisor\DefenseEvaluationController::class, 'index']);
        Route::get('defense-evaluations/{project}/stage/{stage}', [App\Http\Controllers\Supervisor\DefenseEvaluationController::class, 'getEvaluations']);
        Route::post('defense-evaluations', [App\Http\Controllers\Supervisor\DefenseEvaluationController::class, 'submitEvaluation']);
        Route::put('defense-evaluations/{evaluation}', [App\Http\Controllers\Supervisor\DefenseEvaluationController::class, 'updateEvaluation']);
        Route::get('defense-evaluations/{project}/locked/{stage}', [App\Http\Controllers\Supervisor\DefenseEvaluationController::class, 'isLocked']);
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
        Route::get('proposals/submissions', [App\Http\Controllers\ProjectsCommittee\ProposalController::class, 'submissions']);
        Route::post('proposals/{proposal}/approve', [App\Http\Controllers\ProjectsCommittee\ProposalController::class, 'approve']);
        Route::post('proposals/{proposal}/reject', [App\Http\Controllers\ProjectsCommittee\ProposalController::class, 'reject']);
        Route::post('proposals/{proposal}/request-modification', [App\Http\Controllers\ProjectsCommittee\ProposalController::class, 'requestModification']);
        // apiResource automatically includes POST /proposals for store() method
        Route::apiResource('proposals', App\Http\Controllers\ProjectsCommittee\ProposalController::class);
        Route::get('projects/statistics', [App\Http\Controllers\ProjectsCommittee\ProjectController::class, 'statistics']);
        Route::get('projects/{project}/workflow', [App\Http\Controllers\ProjectsCommittee\ProjectController::class, 'workflow']);
        Route::put('projects/{project}/status', [App\Http\Controllers\ProjectsCommittee\ProjectController::class, 'updateStatus']);
        Route::delete('projects/{project}/supervisor', [App\Http\Controllers\ProjectsCommittee\SupervisorController::class, 'unassign']);
        Route::apiResource('projects', App\Http\Controllers\ProjectsCommittee\ProjectController::class)->only(['index', 'show', 'update', 'destroy']);
        Route::post('projects/announce', [App\Http\Controllers\ProjectsCommittee\ProjectController::class, 'announce']);
        Route::post('projects/unannounce', [App\Http\Controllers\ProjectsCommittee\ProjectController::class, 'unannounce']);
        Route::apiResource('periods', App\Http\Controllers\ProjectsCommittee\PeriodController::class);
        Route::get('supervisors', [App\Http\Controllers\ProjectsCommittee\SupervisorController::class, 'index']);
        Route::get('supervisors/assignment-table', [App\Http\Controllers\ProjectsCommittee\SupervisorController::class, 'listForAssignment']);
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
        Route::get('registrations/unified-groups', [App\Http\Controllers\ProjectsCommittee\RegistrationController::class, 'unifiedGroups']);
        Route::get('registrations/groups', [App\Http\Controllers\ProjectsCommittee\RegistrationController::class, 'groups']);
        Route::get('registrations/{registration}', [App\Http\Controllers\ProjectsCommittee\RegistrationController::class, 'show']);
        Route::post('registrations', [App\Http\Controllers\ProjectsCommittee\RegistrationController::class, 'store']);
        Route::post('registrations/{registration}/approve', [App\Http\Controllers\ProjectsCommittee\RegistrationController::class, 'approve']);
        Route::post('registrations/{registration}/reject', [App\Http\Controllers\ProjectsCommittee\RegistrationController::class, 'reject']);
        Route::get('groups/eligible-students', [App\Http\Controllers\ProjectsCommittee\GroupController::class, 'eligibleStudents']);
        Route::get('groups/{group}', [App\Http\Controllers\ProjectsCommittee\GroupController::class, 'show']);
        Route::put('groups/{group}', [App\Http\Controllers\ProjectsCommittee\GroupController::class, 'update']);
        Route::post('groups/{group}/members', [App\Http\Controllers\ProjectsCommittee\GroupController::class, 'addMember']);
        Route::delete('groups/{group}/members/{member}', [App\Http\Controllers\ProjectsCommittee\GroupController::class, 'removeMember']);
        Route::post('committees/distribute', [App\Http\Controllers\ProjectsCommittee\CommitteeController::class, 'distribute']);
        Route::get('committees/members', [App\Http\Controllers\ProjectsCommittee\CommitteeController::class, 'members']);
        Route::get('committees/projects', [App\Http\Controllers\ProjectsCommittee\CommitteeController::class, 'projectsForDiscussion']);
        Route::delete('committees/projects/{project}/assignment', [App\Http\Controllers\ProjectsCommittee\CommitteeController::class, 'removeAssignment']);
        Route::get('grades', [App\Http\Controllers\ProjectsCommittee\GradeController::class, 'index']);
        Route::get('grades/{grade}', [App\Http\Controllers\ProjectsCommittee\GradeController::class, 'show']);
        Route::put('grades/{grade}', [App\Http\Controllers\ProjectsCommittee\GradeController::class, 'update'])
            ->middleware('window:grade_approval');
        Route::post('grades/{grade}/approve', [App\Http\Controllers\ProjectsCommittee\GradeController::class, 'approve'])
            ->middleware('window:grade_approval');
        Route::post('grades/publish', [App\Http\Controllers\ProjectsCommittee\GradeController::class, 'publish']);
        Route::get('reports', [App\Http\Controllers\ProjectsCommittee\ReportController::class, 'index']);
        Route::get('reports/overview', [App\Http\Controllers\ProjectsCommittee\ReportController::class, 'overview']);
        Route::get('reports/projects', [App\Http\Controllers\ProjectsCommittee\ReportController::class, 'projects']);
        Route::get('reports/supervisors', [App\Http\Controllers\ProjectsCommittee\ReportController::class, 'supervisors']);
        Route::get('reports/students', [App\Http\Controllers\ProjectsCommittee\ReportController::class, 'students']);
        Route::get('reports/requests', [App\Http\Controllers\ProjectsCommittee\ReportController::class, 'requests']);
        Route::get('reports/deadlines', [App\Http\Controllers\ProjectsCommittee\ReportController::class, 'deadlines']);
        Route::get('reports/history', [App\Http\Controllers\ProjectsCommittee\ReportController::class, 'history']);
        Route::get('reports/student-groups', [App\Http\Controllers\ProjectsCommittee\ReportController::class, 'studentGroups']);
        Route::get('reports/discussion-committees', [App\Http\Controllers\ProjectsCommittee\ReportController::class, 'discussionCommittees']);
        Route::get('reports/export/pdf', [App\Http\Controllers\ProjectsCommittee\ReportExportController::class, 'pdf']);
        Route::get('reports/export/excel', [App\Http\Controllers\ProjectsCommittee\ReportExportController::class, 'excel']);
        // Defense Evaluation routes (FD1 & FD2) - Project Committee has full control
        Route::get('defense-evaluations', [App\Http\Controllers\ProjectsCommittee\DefenseEvaluationController::class, 'index']);
        Route::get('defense-evaluations/{project}/review/{stage}', [App\Http\Controllers\ProjectsCommittee\DefenseEvaluationController::class, 'getAllEvaluationsForReview']);
        Route::put('defense-evaluations/{evaluation}', [App\Http\Controllers\ProjectsCommittee\DefenseEvaluationController::class, 'updateEvaluation']);
        Route::post('defense-evaluations', [App\Http\Controllers\ProjectsCommittee\DefenseEvaluationController::class, 'addEvaluation']);
        Route::delete('defense-evaluations/{evaluation}', [App\Http\Controllers\ProjectsCommittee\DefenseEvaluationController::class, 'deleteEvaluation']);
        Route::post('defense-approvals/{project}/approve/{stage}', [App\Http\Controllers\ProjectsCommittee\DefenseEvaluationController::class, 'approveStage']);
        Route::post('defense-approvals/{project}/publish/{stage}', [App\Http\Controllers\ProjectsCommittee\DefenseEvaluationController::class, 'publishResults']);
        Route::get('defense-evaluations/{project}/statistics/{stage}', [App\Http\Controllers\ProjectsCommittee\DefenseEvaluationController::class, 'getStatistics']);
    });

    // Discussion Committee routes
    Route::prefix('discussion-committee')->middleware('role:discussion_committee')->group(function () {
        Route::get('dashboard', [App\Http\Controllers\DiscussionCommittee\DashboardController::class, 'index']);
        Route::get('projects', [App\Http\Controllers\DiscussionCommittee\ProjectController::class, 'index']);
        Route::get('projects/{project}', [App\Http\Controllers\DiscussionCommittee\ProjectController::class, 'show']);
        Route::get('projects/{project}/documents/{document}/download', [App\Http\Controllers\DiscussionCommittee\DocumentController::class, 'download']);
        // Custom evaluation routes (before apiResource to match frontend expectations)
        Route::get('evaluations', [App\Http\Controllers\DiscussionCommittee\EvaluationController::class, 'index']);
        Route::get('evaluations/projects', [App\Http\Controllers\DiscussionCommittee\EvaluationController::class, 'projects']);
        Route::post('evaluations', [App\Http\Controllers\DiscussionCommittee\EvaluationController::class, 'store'])
            ->middleware('window:final_defense_phase_1,final_defense_phase_2');
        Route::post('evaluations/batch', [App\Http\Controllers\DiscussionCommittee\EvaluationController::class, 'batchStore'])
            ->middleware('window:final_defense_phase_1,final_defense_phase_2');
        Route::get('evaluations/locked/{project}', [App\Http\Controllers\DiscussionCommittee\EvaluationController::class, 'isLocked']);
        // Defense Evaluation routes (FD1 & FD2) - Independent grading, cannot see peers
        Route::get('defense-evaluations/projects/{stage}', [App\Http\Controllers\DiscussionCommittee\DefenseEvaluationController::class, 'index']);
        Route::get('defense-evaluations/my-evaluations', [App\Http\Controllers\DiscussionCommittee\DefenseEvaluationController::class, 'getMyEvaluations']);
        Route::post('defense-evaluations', [App\Http\Controllers\DiscussionCommittee\DefenseEvaluationController::class, 'submitEvaluation']);
        Route::put('defense-evaluations/{evaluation}', [App\Http\Controllers\DiscussionCommittee\DefenseEvaluationController::class, 'updateEvaluation']);
        Route::get('defense-evaluations/{project}/status/{stage}', [App\Http\Controllers\DiscussionCommittee\DefenseEvaluationController::class, 'getStatus']);
    });

    // Admin routes
    Route::prefix('admin')->middleware('role:admin')->group(function () {
        Route::get('dashboard', [App\Http\Controllers\Admin\DashboardController::class, 'index']);
        Route::get('settings', [App\Http\Controllers\Admin\SystemSettingsController::class, 'index']);
        Route::put('settings', [App\Http\Controllers\Admin\SystemSettingsController::class, 'update']);
        Route::apiResource('users', App\Http\Controllers\Admin\UserController::class);
        Route::get('reports', [App\Http\Controllers\Admin\ReportController::class, 'index']);
        Route::get('reports/overview', [App\Http\Controllers\Admin\ReportController::class, 'overview']);
        Route::get('reports/users', [App\Http\Controllers\Admin\ReportController::class, 'users']);
        Route::get('reports/system', [App\Http\Controllers\Admin\ReportController::class, 'system']);
        Route::get('reports/projects', [App\Http\Controllers\Admin\ReportController::class, 'projects']);
        Route::get('reports/supervisors', [App\Http\Controllers\Admin\ReportController::class, 'supervisors']);
        Route::get('reports/students', [App\Http\Controllers\Admin\ReportController::class, 'students']);
        Route::get('reports/requests', [App\Http\Controllers\Admin\ReportController::class, 'requests']);
        Route::get('reports/deadlines', [App\Http\Controllers\Admin\ReportController::class, 'deadlines']);
        Route::get('reports/history', [App\Http\Controllers\Admin\ReportController::class, 'history']);
        Route::get('reports/export/pdf', [App\Http\Controllers\Admin\ReportExportController::class, 'pdf']);
        Route::get('reports/export/excel', [App\Http\Controllers\Admin\ReportExportController::class, 'excel']);
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

