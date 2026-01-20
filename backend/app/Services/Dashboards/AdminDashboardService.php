<?php

namespace App\Services\Dashboards;

use App\Models\User;
use App\Models\Project;
use App\Models\Proposal;
use App\Models\ProjectRequest;
use App\Enums\ProjectStatus;
use App\Enums\ProposalStatus;
use App\Enums\RequestStatus;
use Illuminate\Support\Facades\DB;

class AdminDashboardService
{
    public function getDashboardData(User $admin): array
    {
        // Users statistics
        $usersTotal = User::count();
        $usersActive = User::where('status', 'active')->count();
        
        $usersByRole = User::select('role', DB::raw('count(*) as count'))
            ->groupBy('role')
            ->pluck('count', 'role')
            ->toArray();

        // Projects statistics
        $projectsTotal = Project::count();
        $projectsByStatus = Project::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Proposals statistics
        $proposalsTotal = Proposal::count();
        $proposalsByStatus = Proposal::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Requests statistics
        $requestsTotal = ProjectRequest::count();
        $requestsByStatus = ProjectRequest::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // System health
        $databaseConnected = false;
        try {
            DB::connection()->getPdo();
            $databaseConnected = true;
        } catch (\Exception $e) {
            // Database not connected
        }

        return [
            'stats' => [
                'usersTotal' => $usersTotal,
                'usersActive' => $usersActive,
                'usersByRole' => $usersByRole,
                'projectsTotal' => $projectsTotal,
                'projectsByStatus' => $projectsByStatus,
                'proposalsTotal' => $proposalsTotal,
                'proposalsByStatus' => $proposalsByStatus,
                'requestsTotal' => $requestsTotal,
                'requestsByStatus' => $requestsByStatus,
            ],
            'systemHealth' => [
                'status' => $databaseConnected ? 'operational' : 'degraded',
                'databaseConnected' => $databaseConnected,
                'timestamp' => now()->toIso8601String(),
            ],
        ];
    }
}
