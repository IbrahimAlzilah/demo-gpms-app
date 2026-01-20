<?php

namespace App\Services\Dashboards;

use App\Models\User;
use App\Models\Project;
use App\Models\Grade;
use App\Models\ProjectMeeting;
use App\Models\ProjectMilestone;
use Carbon\Carbon;

class DiscussionCommitteeDashboardService
{
    public function getDashboardData(User $committeeMember): array
    {
        // Get assigned projects (projects where this committee member is assigned)
        $assignedProjects = Project::whereHas('committeeMembers', function ($q) use ($committeeMember) {
            $q->where('users.id', $committeeMember->id);
        })
        ->where('status', 'in_progress')
        ->with(['students', 'supervisor'])
        ->get();

        $assignedProjectsCount = $assignedProjects->count();

        // Count pending and completed evaluations
        $pendingEvaluations = [];
        $pendingCount = 0;
        $completedCount = 0;

        foreach ($assignedProjects as $project) {
            $students = $project->students;
            if ($students->isEmpty()) {
                continue;
            }

            $grades = Grade::where('project_id', $project->id)->get();
            $evaluatedStudentIds = $grades->filter(function ($grade) {
                return !empty($grade->committee_grade);
            })->pluck('student_id')->toArray();

            $allEvaluated = $students->every(function ($student) use ($evaluatedStudentIds) {
                return in_array($student->id, $evaluatedStudentIds);
            });

            if ($allEvaluated) {
                $completedCount++;
            } else {
                $pendingCount++;
                // Add to pending list (limit to 5)
                if (count($pendingEvaluations) < 5) {
                    $pendingEvaluations[] = [
                        'projectId' => $project->id,
                        'projectTitle' => $project->title,
                        'createdAt' => $project->created_at->toIso8601String(),
                    ];
                }
            }
        }

        // Defense schedule: upcoming meetings for assigned projects
        $projectIds = $assignedProjects->pluck('id')->toArray();
        
        // Get upcoming meetings (treated as defense sessions)
        $upcomingMeetings = ProjectMeeting::whereIn('project_id', $projectIds)
            ->where('scheduled_date', '>=', now())
            ->with(['project:id,title'])
            ->orderBy('scheduled_date', 'asc')
            ->limit(5)
            ->get()
            ->map(function ($meeting) {
                return [
                    'projectId' => $meeting->project_id,
                    'projectTitle' => $meeting->project->title ?? 'Unknown',
                    'scheduledDate' => $meeting->scheduled_date->toIso8601String(),
                    'location' => $meeting->location,
                    'agenda' => $meeting->agenda,
                ];
            });

        // Also get discussion milestones
        $discussionMilestones = ProjectMilestone::whereIn('project_id', $projectIds)
            ->where('type', 'discussion')
            ->where('completed', false)
            ->where('due_date', '>=', now()->toDateString())
            ->with(['project:id,title'])
            ->orderBy('due_date', 'asc')
            ->limit(5)
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

        // Combine meetings and milestones for schedule
        $defenseSchedule = collect($upcomingMeetings)
            ->merge($discussionMilestones->map(function ($milestone) {
                return [
                    'projectId' => $milestone['projectId'],
                    'projectTitle' => $milestone['projectTitle'],
                    'scheduledDate' => Carbon::parse($milestone['dueDate'])->toIso8601String(),
                    'location' => null,
                    'type' => 'milestone',
                    'title' => $milestone['title'],
                ];
            }))
            ->sortBy('scheduledDate')
            ->take(5)
            ->values()
            ->toArray();

        $upcomingScheduleCount = count($defenseSchedule);

        return [
            'stats' => [
                'assignedProjectsCount' => $assignedProjectsCount,
                'pendingEvaluations' => $pendingCount,
                'completedEvaluations' => $completedCount,
                'upcomingScheduleCount' => $upcomingScheduleCount,
            ],
            'pendingEvaluations' => $pendingEvaluations,
            'defenseSchedule' => $defenseSchedule,
        ];
    }
}
