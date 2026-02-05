<?php

namespace App\Services\Dashboards;

use App\Models\User;
use App\Models\Proposal;
use App\Models\ProjectRequest;
use App\Models\Project;
use App\Models\ProjectRegistration;
use App\Models\Grade;
use App\Models\TimePeriod;
use App\Enums\ProjectStatus;
use App\Enums\ProposalStatus;
use App\Enums\RequestStatus;
use Carbon\Carbon;

class ProjectsCommitteeDashboardService
{
    public function getDashboardData(User $committeeMember): array
    {
        // Pending proposals
        $pendingProposals = Proposal::where('status', ProposalStatus::PENDING_REVIEW->value)
            ->count();

        // Pending requests
        $pendingRequests = ProjectRequest::where('status', RequestStatus::PENDING->value)
            ->count();

        // Draft projects to announce
        $draftProjectsToAnnounce = Project::where('status', ProjectStatus::DRAFT->value)
            ->count();

        // Projects without supervisor
        $projectsWithoutSupervisor = Project::whereNull('supervisor_id')
            ->where('status', ProjectStatus::DRAFT->value)
            ->count();

        // Pending registrations
        $pendingRegistrations = ProjectRegistration::where('status', 'pending')
            ->count();

        // Grades pending approval
        $gradesPendingApproval = Grade::where('is_approved', false)
            ->whereNotNull('final_grade')
            ->count();

        // Current phase (active time period; start and end dates inclusive)
        $now = Carbon::now();
        $today = Carbon::today();
        $activePeriods = TimePeriod::where('is_active', true)
            ->where('start_date', '<=', $today)
            ->where('end_date', '>=', $today)
            ->orderBy('end_date', 'asc')
            ->get();

        $currentPeriod = null;
        $progressPercent = 0;
        $endsInDays = null;

        if ($activePeriods->isNotEmpty()) {
            // Pick the one with closest end date
            $currentPeriod = $activePeriods->first();
            $start = Carbon::parse($currentPeriod->start_date);
            $end = Carbon::parse($currentPeriod->end_date);
            $total = $end->diffInDays($start, false);

            if ($total > 0) {
                $elapsed = max(0, $now->diffInDays($start, false));
                $progressPercent = min(100, max(0, round(($elapsed / $total) * 100)));
            }

            // Calculate days remaining: use diffInHours for precision, then convert to days and round to 1 decimal place
            $hoursRemaining = max(0, $now->diffInHours($end, false));
            $endsInDays = round($hoursRemaining / 24, 1);
        }

        // Next upcoming period (start date after today)
        $nextPeriod = TimePeriod::where('start_date', '>', $today)
            ->orderBy('start_date', 'asc')
            ->first();

        return [
            'stats' => [
                'pendingProposals' => $pendingProposals,
                'pendingRequests' => $pendingRequests,
                'draftProjectsToAnnounce' => $draftProjectsToAnnounce,
                'projectsWithoutSupervisor' => $projectsWithoutSupervisor,
                'pendingRegistrations' => $pendingRegistrations,
                'gradesPendingApproval' => $gradesPendingApproval,
            ],
            'currentPhase' => [
                'period' => $currentPeriod ? [
                    'id' => $currentPeriod->id,
                    'name' => $currentPeriod->name,
                    'type' => $currentPeriod->type,
                    'startDate' => $currentPeriod->start_date->toDateString(),
                    'endDate' => $currentPeriod->end_date->toDateString(),
                    'isActive' => $currentPeriod->is_active,
                ] : null,
                'progressPercent' => $progressPercent,
                'endsInDays' => $endsInDays,
                'nextPeriod' => $nextPeriod ? [
                    'id' => $nextPeriod->id,
                    'name' => $nextPeriod->name,
                    'type' => $nextPeriod->type,
                    'startDate' => $nextPeriod->start_date->toDateString(),
                    'endDate' => $nextPeriod->end_date->toDateString(),
                ] : null,
            ],
        ];
    }
}
