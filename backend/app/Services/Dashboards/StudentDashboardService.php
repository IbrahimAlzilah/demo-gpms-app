<?php

namespace App\Services\Dashboards;

use App\Models\User;
use App\Models\Project;
use App\Models\Proposal;
use App\Models\ProjectRequest;
use App\Models\Document;
use App\Models\Notification;
use App\Models\ProjectMilestone;
use App\Models\ProjectMeeting;
use App\Models\TimePeriod;
use App\Enums\TimePeriodType;
use App\Services\ProjectService;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class StudentDashboardService
{
    public function __construct(
        protected ProjectService $projectService
    ) {}

    public function getDashboardData(User $student): array
    {
        // Get student's registered project
        $myProject = Project::whereHas('students', function ($q) use ($student) {
            $q->where('users.id', $student->id);
        })->with(['supervisor', 'students'])->first();

        // KPIs
        $pendingProposals = Proposal::where('submitter_id', $student->id)
            ->where('status', 'pending_review')
            ->count();

        $pendingRequests = ProjectRequest::where('student_id', $student->id)
            ->where('status', 'pending')
            ->count();

        $documentsSubmittedCount = 0;
        $progressPercentage = 0;
        $myProjectStatus = null;

        if ($myProject) {
            $documentsSubmittedCount = Document::where('project_id', $myProject->id)
                ->where('submitted_by', $student->id)
                ->count();

            $progressPercentage = $this->projectService->calculateProgressPercentage($myProject);
            $myProjectStatus = $myProject->status->value;
        }

        $unreadNotifications = Notification::where('user_id', $student->id)
            ->where('is_read', false)
            ->count();

        // Active time windows relevant to students
        $relevantTypes = [
            TimePeriodType::PROPOSAL_SUBMISSION->value,
            TimePeriodType::PROJECT_REGISTRATION->value,
            TimePeriodType::CHAPTER_SUBMISSION_PHASE_1->value,
            TimePeriodType::CHAPTER_SUBMISSION_PHASE_2->value,
            TimePeriodType::FINAL_PROJECT_DOCUMENT_SUBMISSION->value,
            TimePeriodType::FINAL_DEFENSE_PHASE_1->value,
            TimePeriodType::FINAL_DEFENSE_PHASE_2->value,
        ];

        $today = Carbon::today();
        $activeTimeWindows = TimePeriod::whereIn('type', $relevantTypes)
            ->where('is_active', true)
            ->where('start_date', '<=', $today)
            ->where('end_date', '>=', $today)
            ->orderBy('end_date', 'asc')
            ->get()
            ->map(function ($period) {
                // Calculate days remaining: use diffInHours for precision, then convert to days and round to 1 decimal place
                $now = Carbon::now();
                $end = Carbon::parse($period->end_date);
                $hoursRemaining = max(0, $now->diffInHours($end, false));
                $daysRemaining = round($hoursRemaining / 24, 1);

                return [
                    'id' => $period->id,
                    'name' => $period->name,
                    'type' => $period->type,
                    'startDate' => $period->start_date->toDateString(),
                    'endDate' => $period->end_date->toDateString(),
                    'daysRemaining' => $daysRemaining,
                    'description' => $period->description,
                ];
            });

        // Timeline: upcoming milestones and meetings
        $upcomingMilestones = [];
        $upcomingMeetings = [];

        if ($myProject) {
            $upcomingMilestones = ProjectMilestone::where('project_id', $myProject->id)
                ->where('completed', false)
                ->where('due_date', '>=', now()->toDateString())
                ->orderBy('due_date', 'asc')
                ->limit(5)
                ->get()
                ->map(function ($milestone) {
                    $daysUntil = now()->diffInDays($milestone->due_date, false);
                    return [
                        'id' => $milestone->id,
                        'title' => $milestone->title,
                        'description' => $milestone->description,
                        'dueDate' => $milestone->due_date->toDateString(),
                        'type' => $milestone->type,
                        'daysUntil' => max(0, $daysUntil),
                        'isOverdue' => $milestone->due_date < now(),
                    ];
                });

            $upcomingMeetings = ProjectMeeting::where('project_id', $myProject->id)
                ->where('scheduled_date', '>=', now())
                ->with(['scheduledBy'])
                ->orderBy('scheduled_date', 'asc')
                ->limit(5)
                ->get()
                ->map(function ($meeting) {
                    return [
                        'id' => $meeting->id,
                        'scheduledDate' => $meeting->scheduled_date->toIso8601String(),
                        'duration' => $meeting->duration,
                        'location' => $meeting->location,
                        'agenda' => $meeting->agenda,
                        'scheduledBy' => $meeting->scheduledBy ? [
                            'id' => $meeting->scheduledBy->id,
                            'name' => $meeting->scheduledBy->name,
                        ] : null,
                    ];
                });
        }

        return [
            'stats' => [
                'myProjectStatus' => $myProjectStatus,
                'progressPercentage' => $progressPercentage,
                'pendingProposals' => $pendingProposals,
                'pendingRequests' => $pendingRequests,
                'documentsSubmittedCount' => $documentsSubmittedCount,
                'unreadNotifications' => $unreadNotifications,
            ],
            'myProject' => $myProject ? [
                'id' => $myProject->id,
                'title' => $myProject->title,
                'status' => $myProject->status->value,
                'supervisor' => $myProject->supervisor ? [
                    'id' => $myProject->supervisor->id,
                    'name' => $myProject->supervisor->name,
                ] : null,
            ] : null,
            'activeTimeWindows' => $activeTimeWindows,
            'timeline' => [
                'upcomingMilestones' => $upcomingMilestones,
                'upcomingMeetings' => $upcomingMeetings,
            ],
        ];
    }
}
