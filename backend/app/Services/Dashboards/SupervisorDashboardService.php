<?php

namespace App\Services\Dashboards;

use App\Models\User;
use App\Models\Project;
use App\Models\ProjectRequest;
use App\Models\Grade;
use App\Models\ProjectMilestone;
use App\Models\ProjectMeeting;
use App\Models\SupervisorAssignmentRequest;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SupervisorDashboardService
{
    public function getDashboardData(User $supervisor): array
    {
        // Get supervised projects
        $supervisedProjects = Project::where('supervisor_id', $supervisor->id)
            ->with(['students'])
            ->get();

        $supervisedProjectsCount = $supervisedProjects->count();

        // Pending supervision requests: committee assignment requests awaiting supervisor response
        $pendingSupervisionRequests = SupervisorAssignmentRequest::where('supervisor_id', $supervisor->id)
            ->where('status', 'pending')
            ->count();

        // Pending evaluations: projects with students missing supervisor_grade
        $pendingEvaluations = 0;
        $projectsNeedingAttention = [];

        foreach ($supervisedProjects as $project) {
            $students = $project->students;
            if ($students->isEmpty()) {
                continue;
            }

            $grades = Grade::where('project_id', $project->id)->get();
            $gradedStudentIds = $grades->filter(function ($grade) {
                return !empty($grade->supervisor_grade);
            })->pluck('student_id')->toArray();

            $ungradedStudents = $students->filter(function ($student) use ($gradedStudentIds) {
                return !in_array($student->id, $gradedStudentIds);
            });

            if ($ungradedStudents->isNotEmpty()) {
                $pendingEvaluations++;
                $projectsNeedingAttention[] = [
                    'id' => $project->id,
                    'title' => $project->title,
                    'ungradedStudentsCount' => $ungradedStudents->count(),
                ];
            }
        }

        // Upcoming meetings across all supervised projects
        $settingsService = app(\App\Services\SettingsService::class);
        $dashboardDisplayLimit = $settingsService->getDashboardDisplayLimit();
        $projectIds = $supervisedProjects->pluck('id')->toArray();
        $upcomingMeetings = ProjectMeeting::whereIn('project_id', $projectIds)
            ->where('scheduled_date', '>=', now())
            ->with(['project:id,title', 'scheduledBy:id,name'])
            ->orderBy('scheduled_date', 'asc')
            ->limit($dashboardDisplayLimit)
            ->get()
            ->map(function ($meeting) {
                return [
                    'id' => $meeting->id,
                    'projectId' => $meeting->project_id,
                    'projectTitle' => $meeting->project->title ?? 'Unknown',
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

        $upcomingMeetingsCount = ProjectMeeting::whereIn('project_id', $projectIds)
            ->where('scheduled_date', '>=', now())
            ->count();

        // Overdue milestones
        $overdueMilestones = ProjectMilestone::whereIn('project_id', $projectIds)
            ->where('completed', false)
            ->where('due_date', '<', now()->toDateString())
            ->with(['project:id,title'])
            ->orderBy('due_date', 'asc')
            ->limit($dashboardDisplayLimit)
            ->get()
            ->map(function ($milestone) {
                $daysOverdue = now()->diffInDays($milestone->due_date, false);
                return [
                    'id' => $milestone->id,
                    'projectId' => $milestone->project_id,
                    'projectTitle' => $milestone->project->title ?? 'Unknown',
                    'title' => $milestone->title,
                    'dueDate' => $milestone->due_date->toDateString(),
                    'daysOverdue' => abs($daysOverdue),
                ];
            });

        $overdueMilestonesCount = ProjectMilestone::whereIn('project_id', $projectIds)
            ->where('completed', false)
            ->where('due_date', '<', now()->toDateString())
            ->count();

        // Soon milestones (due within configurable days threshold)
        $soonMilestoneDays = $settingsService->getDashboardSoonMilestoneDaysThreshold();
        $soonMilestones = ProjectMilestone::whereIn('project_id', $projectIds)
            ->where('completed', false)
            ->where('due_date', '>=', now()->toDateString())
            ->where('due_date', '<=', now()->addDays($soonMilestoneDays)->toDateString())
            ->with(['project:id,title'])
            ->orderBy('due_date', 'asc')
            ->limit($dashboardDisplayLimit)
            ->get()
            ->map(function ($milestone) {
                $daysUntil = now()->diffInDays($milestone->due_date, false);
                return [
                    'id' => $milestone->id,
                    'projectId' => $milestone->project_id,
                    'projectTitle' => $milestone->project->title ?? 'Unknown',
                    'title' => $milestone->title,
                    'dueDate' => $milestone->due_date->toDateString(),
                    'daysUntil' => max(0, $daysUntil),
                ];
            });

        return [
            'stats' => [
                'supervisedProjectsCount' => $supervisedProjectsCount,
                'pendingSupervisionRequests' => $pendingSupervisionRequests,
                'pendingEvaluations' => $pendingEvaluations,
                'upcomingMeetingsCount' => $upcomingMeetingsCount,
                'overdueMilestonesCount' => $overdueMilestonesCount,
            ],
            'upcomingMeetings' => $upcomingMeetings,
            'overdueMilestones' => $overdueMilestones,
            'soonMilestones' => $soonMilestones,
            'projectsNeedingAttention' => array_slice($projectsNeedingAttention, 0, $dashboardDisplayLimit),
        ];
    }
}
