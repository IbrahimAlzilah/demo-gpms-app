<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Proposal;
use App\Models\ProjectRequest;
use App\Models\Grade;
use App\Models\TimePeriod;
use App\Models\User;
use App\Models\ProjectMilestone;
use App\Models\ProjectMeeting;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportService
{
    /**
     * Apply common filters to a base query
     */
    protected function applyCommonFilters($query, array $filters): void
    {
        // Date range filter
        if (isset($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }
        if (isset($filters['date_to'])) {
            $query->where('created_at', '<=', Carbon::parse($filters['date_to'])->endOfDay());
        }

        // Period filter - filter by date range of the period
        if (isset($filters['period_id'])) {
            $period = TimePeriod::find($filters['period_id']);
            if ($period && $period->type === 'general') {
                $query->whereBetween('created_at', [
                    $period->start_date->startOfDay(),
                    $period->end_date->endOfDay()
                ]);
            }
        }
    }

    /**
     * Get period date range
     */
    public function getPeriodDateRange(?int $periodId): ?array
    {
        if (!$periodId) {
            return null;
        }

        $period = TimePeriod::find($periodId);
        if (!$period || $period->type !== 'general') {
            return null;
        }

        return [
            'from' => $period->start_date->startOfDay(),
            'to' => $period->end_date->endOfDay(),
        ];
    }
    /**
     * Generate projects committee report
     */
    public function generateProjectsCommitteeReport(): array
    {
        $projects = Project::all();
        $proposals = Proposal::all();
        $requests = ProjectRequest::all();
        $grades = Grade::all();

        $projectsByStatus = $projects->groupBy('status')->map->count();
        $proposalsByStatus = $proposals->groupBy('status')->map->count();
        $requestsByStatus = $requests->groupBy('status')->map->count();

        $totalGrades = $grades->sum(function ($grade) {
            return $grade->final_grade ?? $grade->supervisor_grade['score'] ?? 0;
        });
        $averageGrade = $grades->count() > 0 ? $totalGrades / $grades->count() : 0;

        // Get students data
        $allStudents = \App\Models\User::where('role', 'student')->get();
        $registeredStudents = DB::table('project_student')
            ->distinct('student_id')
            ->count('student_id');
        $unregisteredStudents = $allStudents->count() - $registeredStudents;

        return [
            'projects' => [
                'total' => $projects->count(),
                'byStatus' => $projectsByStatus->toArray(),
            ],
            'proposals' => [
                'total' => $proposals->count(),
                'byStatus' => $proposalsByStatus->toArray(),
            ],
            'requests' => [
                'total' => $requests->count(),
                'byStatus' => $requestsByStatus->toArray(),
            ],
            'evaluations' => [
                'total' => $grades->count(),
                'averageGrade' => round($averageGrade, 2),
            ],
            'students' => [
                'total' => $allStudents->count(),
                'registered' => $registeredStudents,
                'unregistered' => $unregisteredStudents,
            ],
        ];
    }

    /**
     * Generate admin system report
     */
    public function generateAdminReport(): array
    {
        $report = $this->generateProjectsCommitteeReport();

        $usersByRole = DB::table('users')
            ->select('role', DB::raw('count(*) as count'))
            ->groupBy('role')
            ->pluck('count', 'role')
            ->toArray();

        $report['users'] = [
            'total' => array_sum($usersByRole),
            'byRole' => $usersByRole,
        ];

        return $report;
    }

    /**
     * Generate overview report with KPIs and chart data
     */
    public function generateOverviewReport(array $filters = []): array
    {
        $dateRange = $this->getPeriodDateRange($filters['period_id'] ?? null);

        // Projects KPIs
        $projectsQuery = Project::query();
        if ($dateRange) {
            $projectsQuery->whereBetween('created_at', [$dateRange['from'], $dateRange['to']]);
        }
        if (isset($filters['status'])) {
            $projectsQuery->where('status', $filters['status']);
        }
        if (isset($filters['supervisor_id'])) {
            $projectsQuery->where('supervisor_id', $filters['supervisor_id']);
        }
        if (isset($filters['project_specialization'])) {
            $projectsQuery->where('specialization', $filters['project_specialization']);
        }

        $projectsTotal = $projectsQuery->count();
        $projectsByStatus = $projectsQuery->groupBy('status')->selectRaw('status, count(*) as count')
            ->pluck('count', 'status')->toArray();

        // Proposals KPIs
        $proposalsQuery = Proposal::query();
        if ($dateRange) {
            $proposalsQuery->whereBetween('created_at', [$dateRange['from'], $dateRange['to']]);
        }
        $proposalsTotal = $proposalsQuery->count();
        $proposalsByStatus = $proposalsQuery->groupBy('status')->selectRaw('status, count(*) as count')
            ->pluck('count', 'status')->toArray();

        // Requests KPIs
        $requestsQuery = ProjectRequest::query();
        if ($dateRange) {
            $requestsQuery->whereBetween('created_at', [$dateRange['from'], $dateRange['to']]);
        }
        if (isset($filters['request_status'])) {
            $requestsQuery->where('status', $filters['request_status']);
        }
        $requestsTotal = $requestsQuery->count();
        $requestsByStatus = $requestsQuery->groupBy('status')->selectRaw('status, count(*) as count')
            ->pluck('count', 'status')->toArray();

        // Students KPIs
        $allStudentsQuery = User::where('role', 'student');
        if (isset($filters['department'])) {
            $allStudentsQuery->whereHas('studentProfile', function ($q) use ($filters) {
                $q->where('major', $filters['department']);
            });
        }
        $studentsTotal = $allStudentsQuery->count();

        $registeredQuery = DB::table('project_student')
            ->join('projects', 'project_student.project_id', '=', 'projects.id');
        if ($dateRange) {
            $registeredQuery->whereBetween('project_student.created_at', [$dateRange['from'], $dateRange['to']]);
        }
        if (isset($filters['department'])) {
            $registeredQuery->join('users', 'project_student.student_id', '=', 'users.id')
                ->join('students', 'users.id', '=', 'students.user_id')
                ->where('students.major', $filters['department']);
        }
        $registeredCount = $registeredQuery->distinct('project_student.student_id')->count('project_student.student_id');
        $unregisteredCount = max(0, $studentsTotal - $registeredCount);

        // Evaluations KPIs
        $gradesQuery = Grade::query();
        if ($dateRange) {
            $gradesQuery->whereBetween('created_at', [$dateRange['from'], $dateRange['to']]);
        }
        $gradesTotal = $gradesQuery->count();
        $grades = $gradesQuery->get();
        $totalGrades = $grades->sum(function ($grade) {
            return $grade->final_grade ?? $grade->supervisor_grade['score'] ?? 0;
        });
        $averageGrade = $gradesTotal > 0 ? round($totalGrades / $gradesTotal, 2) : 0;

        // Milestones KPIs
        $milestonesQuery = ProjectMilestone::query();
        if ($dateRange) {
            $milestonesQuery->whereBetween('created_at', [$dateRange['from'], $dateRange['to']]);
        }
        $milestonesTotal = $milestonesQuery->count();
        $completedMilestones = $milestonesQuery->where('completed', true)->count();
        $overdueMilestones = $milestonesQuery->where('completed', false)
            ->where('due_date', '<', now())->count();

        // Chart data - Projects by status over time (last 6 months)
        $chartData = $this->getProjectsStatusChartData($dateRange);

        return [
            'kpis' => [
                'projects' => [
                    'total' => $projectsTotal,
                    'byStatus' => $projectsByStatus,
                ],
                'proposals' => [
                    'total' => $proposalsTotal,
                    'byStatus' => $proposalsByStatus,
                ],
                'requests' => [
                    'total' => $requestsTotal,
                    'byStatus' => $requestsByStatus,
                ],
                'students' => [
                    'total' => $studentsTotal,
                    'registered' => $registeredCount,
                    'unregistered' => $unregisteredCount,
                ],
                'evaluations' => [
                    'total' => $gradesTotal,
                    'averageGrade' => $averageGrade,
                ],
                'milestones' => [
                    'total' => $milestonesTotal,
                    'completed' => $completedMilestones,
                    'overdue' => $overdueMilestones,
                ],
            ],
            'charts' => $chartData,
        ];
    }

    /**
     * Get projects status chart data
     */
    protected function getProjectsStatusChartData(?array $dateRange): array
    {
        $months = 6;
        $chartData = [];

        for ($i = $months - 1; $i >= 0; $i--) {
            $monthStart = now()->subMonths($i)->startOfMonth();
            $monthEnd = now()->subMonths($i)->endOfMonth();

            if ($dateRange) {
                if ($monthEnd < $dateRange['from'] || $monthStart > $dateRange['to']) {
                    continue;
                }
            }

            $monthProjects = Project::whereBetween('created_at', [$monthStart, $monthEnd])
                ->groupBy('status')
                ->selectRaw('status, count(*) as count')
                ->pluck('count', 'status')
                ->toArray();

            $chartData[] = [
                'month' => $monthStart->format('Y-m'),
                'label' => $monthStart->format('M Y'),
                'data' => $monthProjects,
            ];
        }

        return $chartData;
    }

    /**
     * Generate projects report with drill-down data
     */
    public function generateProjectsReport(array $filters = []): array
    {
        $dateRange = $this->getPeriodDateRange($filters['period_id'] ?? null);

        $query = Project::with(['supervisor', 'students']);

        if ($dateRange) {
            $query->whereBetween('created_at', [$dateRange['from'], $dateRange['to']]);
        }
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (isset($filters['supervisor_id'])) {
            $query->where('supervisor_id', $filters['supervisor_id']);
        }
        if (isset($filters['project_specialization'])) {
            $query->where('specialization', $filters['project_specialization']);
        }

        // Add computed phase
        $projects = $query->get()->map(function ($project) {
            $project->phase = $this->computeProjectPhase($project);
            return $project;
        });

        // Aggregations
        $byStatus = $projects->groupBy('status')->map->count()->toArray();
        $byPhase = $projects->groupBy('phase')->map->count()->toArray();
        $bySpecialization = $projects->groupBy('specialization')->map->count()->toArray();

        return [
            'summary' => [
                'total' => $projects->count(),
                'byStatus' => $byStatus,
                'byPhase' => $byPhase,
                'bySpecialization' => $bySpecialization,
            ],
            'projects' => $projects,
        ];
    }

    /**
     * Compute project phase
     */
    protected function computeProjectPhase(Project $project): string
    {
        if ($project->status === 'completed') {
            return 'completed_phase';
        }
        if ($project->status === 'in_progress') {
            return 'in_progress_phase';
        }
        if ($project->status === 'available_for_registration') {
            return 'registration_phase';
        }
        if ($project->proposals()->exists()) {
            return 'proposal_phase';
        }
        if ($project->grades()->exists()) {
            return 'evaluation_phase';
        }
        return 'draft_phase';
    }

    /**
     * Generate supervisors workload report
     */
    public function generateSupervisorsReport(array $filters = []): array
    {
        $dateRange = $this->getPeriodDateRange($filters['period_id'] ?? null);

        $query = User::where('role', 'supervisor')
            ->where('status', 'active');

        if (isset($filters['department'])) {
            $query->where('department', $filters['department']);
        }

        $supervisors = $query->get()->map(function ($supervisor) use ($dateRange, $filters) {
            $projectsQuery = Project::where('supervisor_id', $supervisor->id);
            if ($dateRange) {
                $projectsQuery->whereBetween('created_at', [$dateRange['from'], $dateRange['to']]);
            }
            if (isset($filters['status'])) {
                $projectsQuery->where('status', $filters['status']);
            }

            $projects = $projectsQuery->get();
            $studentsCount = $projects->sum('current_students');

            // Get average grade for projects with grades
            $grades = Grade::whereIn('project_id', $projects->pluck('id'))->get();
            $avgGrade = $grades->count() > 0
                ? round($grades->avg(function ($g) {
                    return $g->final_grade ?? $g->supervisor_grade['score'] ?? 0;
                }), 2)
                : null;

            // Pending evaluations (projects without grades)
            $pendingEvaluations = $projects->filter(function ($p) {
                return !$p->grades()->exists();
            })->count();

            return [
                'id' => $supervisor->id,
                'name' => $supervisor->name,
                'email' => $supervisor->email,
                'department' => $supervisor->department,
                'projects_count' => $projects->count(),
                'students_count' => $studentsCount,
                'average_grade' => $avgGrade,
                'pending_evaluations' => $pendingEvaluations,
            ];
        });

        return [
            'summary' => [
                'total' => $supervisors->count(),
                'total_projects' => $supervisors->sum('projects_count'),
                'total_students' => $supervisors->sum('students_count'),
            ],
            'supervisors' => $supervisors->values(),
        ];
    }

    /**
     * Generate students participation report
     */
    public function generateStudentsReport(array $filters = []): array
    {
        $dateRange = $this->getPeriodDateRange($filters['period_id'] ?? null);

        $query = User::where('role', 'student')
            ->with('studentProfile');

        if (isset($filters['department'])) {
            $query->whereHas('studentProfile', function ($q) use ($filters) {
                $q->where('major', $filters['department']);
            });
        }

        $students = $query->get()->map(function ($student) use ($dateRange) {
            $projectQuery = DB::table('project_student')
                ->where('student_id', $student->id)
                ->join('projects', 'project_student.project_id', '=', 'projects.id')
                ->select('projects.*');

            if ($dateRange) {
                $projectQuery->whereBetween('project_student.created_at', [$dateRange['from'], $dateRange['to']]);
            }

            $projectRow = $projectQuery->first();
            $isRegistered = $projectRow !== null;

            // Check if in a group
            $groupQuery = DB::table('student_group_members')
                ->where('student_id', $student->id)
                ->join('student_groups', 'student_group_members.group_id', '=', 'student_groups.id')
                ->join('projects', 'projects.assigned_group_id', '=', 'student_groups.id')
                ->select('projects.id', 'projects.title', 'student_groups.id as group_id');

            if ($dateRange) {
                $groupQuery->whereBetween('student_group_members.created_at', [$dateRange['from'], $dateRange['to']]);
            }

            $groupRow = $groupQuery->first();

            return [
                'id' => $student->id,
                'name' => $student->name,
                'student_id' => $student->student_id,
                'email' => $student->email,
                'department' => $student->department,
                'is_registered' => $isRegistered,
                'project_id' => $projectRow->id ?? null,
                'project_title' => $projectRow->title ?? null,
                'is_in_group' => $groupRow !== null,
                'group_id' => $groupRow->group_id ?? null,
            ];
        });

        $registered = $students->where('is_registered', true);
        $unregistered = $students->where('is_registered', false);
        $inGroups = $students->where('is_in_group', true);

        return [
            'summary' => [
                'total' => $students->count(),
                'registered' => $registered->count(),
                'unregistered' => $unregistered->count(),
                'in_groups' => $inGroups->count(),
            ],
            'students' => $students->values(),
        ];
    }

    /**
     * Generate requests lifecycle report
     */
    public function generateRequestsReport(array $filters = []): array
    {
        $dateRange = $this->getPeriodDateRange($filters['period_id'] ?? null);

        $query = ProjectRequest::with(['student', 'project']);

        if ($dateRange) {
            $query->whereBetween('created_at', [$dateRange['from'], $dateRange['to']]);
        }
        if (isset($filters['request_status'])) {
            $query->where('status', $filters['request_status']);
        }
        if (isset($filters['request_type'])) {
            $query->where('type', $filters['request_type']);
        }

        $requests = $query->get();

        $byStatus = $requests->groupBy('status')->map->count()->toArray();
        $byType = $requests->groupBy('type')->map->count()->toArray();

        // Calculate approval rates
        $total = $requests->count();
        $approved = $requests->whereIn('status', ['committee_approved', 'supervisor_approved'])->count();
        $rejected = $requests->whereIn('status', ['committee_rejected', 'supervisor_rejected'])->count();
        $pending = $requests->where('status', 'pending')->count();

        return [
            'summary' => [
                'total' => $total,
                'approved' => $approved,
                'rejected' => $rejected,
                'pending' => $pending,
                'approval_rate' => $total > 0 ? round(($approved / $total) * 100, 2) : 0,
                'byStatus' => $byStatus,
                'byType' => $byType,
            ],
            'requests' => $requests,
        ];
    }

    /**
     * Generate deadlines and delays report
     */
    public function generateDeadlinesReport(array $filters = []): array
    {
        $dateRange = $this->getPeriodDateRange($filters['period_id'] ?? null);

        $query = ProjectMilestone::with(['project']);

        if ($dateRange) {
            $query->whereBetween('created_at', [$dateRange['from'], $dateRange['to']]);
        }

        $milestones = $query->get();

        $overdue = $milestones->filter(function ($m) {
            return !$m->completed && $m->due_date < now();
        });

        $completed = $milestones->where('completed', true);
        $onTime = $completed->filter(function ($m) {
            return $m->completed_at && $m->completed_at <= $m->due_date;
        });
        $delayed = $completed->filter(function ($m) {
            return $m->completed_at && $m->completed_at > $m->due_date;
        });

        // Calculate average delay
        $delays = $delayed->map(function ($m) {
            return $m->completed_at->diffInDays($m->due_date);
        });
        $avgDelay = $delays->count() > 0 ? round($delays->avg(), 2) : 0;

        return [
            'summary' => [
                'total' => $milestones->count(),
                'completed' => $completed->count(),
                'overdue' => $overdue->count(),
                'on_time' => $onTime->count(),
                'delayed' => $delayed->count(),
                'average_delay_days' => $avgDelay,
            ],
            'overdue_milestones' => $overdue->values(),
        ];
    }

    /**
     * Generate users report (Admin - system management)
     */
    public function generateUsersReport(array $filters = []): array
    {
        $query = User::query();

        $this->applyCommonFilters($query, $filters);

        if (isset($filters['role'])) {
            $query->where('role', $filters['role']);
        }
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $users = $query->with(['studentProfile', 'supervisorProfile'])->get();

        $byRole = $users->groupBy('role')->map->count()->toArray();
        $byStatus = $users->groupBy('status')->map->count()->toArray();

        return [
            'summary' => [
                'total' => $users->count(),
                'byRole' => $byRole,
                'byStatus' => $byStatus,
            ],
            'users' => $users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'username' => $user->username,
                    'role' => $user->role,
                    'status' => $user->status,
                    'student_id' => $user->studentProfile?->student_id,
                    'emp_id' => $user->supervisorProfile?->emp_id,
                    'department' => $user->studentProfile?->major ?? $user->supervisorProfile?->department,
                    'created_at' => $user->created_at?->toISOString(),
                ];
            })->values(),
        ];
    }

    /**
     * Generate system configuration report (Admin - time periods, active windows)
     */
    public function generateSystemReport(): array
    {
        $periods = TimePeriod::with('creator')->orderBy('start_date', 'desc')->get();

        $byType = $periods->groupBy('type')->map(function ($group) {
            return [
                'total' => $group->count(),
                'active' => $group->filter(fn ($p) => $p->isCurrentlyActive())->count(),
                'scheduled' => $group->filter(fn ($p) => $p->isScheduled())->count(),
                'ended' => $group->filter(fn ($p) => $p->hasEnded())->count(),
            ];
        })->toArray();

        $activePeriods = $periods->filter(fn ($p) => $p->isCurrentlyActive())->values();
        $upcomingPeriods = $periods->filter(fn ($p) => $p->isScheduled())->sortBy('start_date')->take(5)->values();

        return [
            'summary' => [
                'total_periods' => $periods->count(),
                'active_periods' => $activePeriods->count(),
                'upcoming_periods' => $upcomingPeriods->count(),
                'byType' => $byType,
            ],
            'active_periods' => $activePeriods->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'type' => $p->type,
                'start_date' => $p->start_date->format('Y-m-d'),
                'end_date' => $p->end_date->format('Y-m-d'),
                'academic_year' => $p->academic_year,
                'semester' => $p->semester,
            ])->values(),
            'upcoming_periods' => $upcomingPeriods->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'type' => $p->type,
                'start_date' => $p->start_date->format('Y-m-d'),
                'end_date' => $p->end_date->format('Y-m-d'),
            ])->values(),
        ];
    }

    /**
     * Generate admin overview report (extends committee overview with users)
     */
    public function generateAdminOverviewReport(array $filters = []): array
    {
        $overview = $this->generateOverviewReport($filters);

        $usersByRole = \Illuminate\Support\Facades\DB::table('users')
            ->select('role', \Illuminate\Support\Facades\DB::raw('count(*) as count'))
            ->groupBy('role')
            ->pluck('count', 'role')
            ->toArray();

        $usersByStatus = \Illuminate\Support\Facades\DB::table('users')
            ->select('status', \Illuminate\Support\Facades\DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $overview['kpis']['users'] = [
            'total' => array_sum($usersByRole),
            'byRole' => $usersByRole,
            'byStatus' => $usersByStatus,
        ];

        return $overview;
    }

    /**
     * Generate historical comparison report
     */
    public function generateHistoryReport(int $periodsCount = 5): array
    {
        $periods = TimePeriod::where('type', 'general')
            ->orderBy('start_date', 'desc')
            ->take($periodsCount)
            ->get();

        $comparison = $periods->map(function ($period) {
            $filters = ['period_id' => $period->id];
            $overview = $this->generateOverviewReport($filters);

            return [
                'period_id' => $period->id,
                'period_name' => $period->name,
                'academic_year' => $period->academic_year,
                'semester' => $period->semester,
                'start_date' => $period->start_date->format('Y-m-d'),
                'end_date' => $period->end_date->format('Y-m-d'),
                'kpis' => $overview['kpis'],
            ];
        });

        return [
            'periods' => $comparison->values(),
        ];
    }
}

