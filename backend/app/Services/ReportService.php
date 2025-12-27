<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Proposal;
use App\Models\ProjectRequest;
use App\Models\Grade;
use Illuminate\Support\Facades\DB;

class ReportService
{
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
}

