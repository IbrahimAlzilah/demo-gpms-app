<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReportFiltersRequest;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class ReportExportController extends Controller
{
    public function __construct(
        protected ReportService $reportService
    ) {}

    /**
     * Export report as PDF (text format)
     */
    public function pdf(ReportFiltersRequest $request): \Illuminate\Http\Response
    {
        $reportType = $request->get('report', 'overview');
        $filters = $request->validated();

        $content = $this->generateTextReport($reportType, $filters);
        $filename = $this->getFilename($reportType, 'txt');

        return Response::make($content, 200, [
            'Content-Type' => 'text/plain',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Export report as Excel/CSV
     */
    public function excel(ReportFiltersRequest $request): \Illuminate\Http\Response
    {
        $reportType = $request->get('report', 'overview');
        $filters = $request->validated();

        $content = $this->generateCsvReport($reportType, $filters);
        $filename = $this->getFilename($reportType, 'csv');

        return Response::make($content, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    protected function generateTextReport(string $reportType, array $filters): string
    {
        $content = "=== ADMIN SYSTEM REPORT ===\n";
        $content .= "Generated: " . now()->format('Y-m-d H:i:s') . "\n\n";

        switch ($reportType) {
            case 'overview':
                $report = $this->reportService->generateAdminOverviewReport($filters);
                $content .= $this->formatOverviewReport($report);
                break;
            case 'users':
                $report = $this->reportService->generateUsersReport($filters);
                $content .= $this->formatUsersReport($report);
                break;
            case 'system':
                $report = $this->reportService->generateSystemReport();
                $content .= $this->formatSystemReport($report);
                break;
            case 'projects':
                $report = $this->reportService->generateProjectsReport($filters);
                $content .= $this->formatProjectsReport($report);
                break;
            case 'supervisors':
                $report = $this->reportService->generateSupervisorsReport($filters);
                $content .= $this->formatSupervisorsReport($report);
                break;
            case 'students':
                $report = $this->reportService->generateStudentsReport($filters);
                $content .= $this->formatStudentsReport($report);
                break;
            case 'requests':
                $report = $this->reportService->generateRequestsReport($filters);
                $content .= $this->formatRequestsReport($report);
                break;
            case 'deadlines':
                $report = $this->reportService->generateDeadlinesReport($filters);
                $content .= $this->formatDeadlinesReport($report);
                break;
            default:
                $content .= "Unknown report type: {$reportType}\n";
        }

        return $content;
    }

    protected function generateCsvReport(string $reportType, array $filters): string
    {
        $output = fopen('php://temp', 'r+');

        switch ($reportType) {
            case 'overview':
                $report = $this->reportService->generateAdminOverviewReport($filters);
                $this->writeOverviewCsv($output, $report);
                break;
            case 'users':
                $report = $this->reportService->generateUsersReport($filters);
                $this->writeUsersCsv($output, $report);
                break;
            case 'system':
                $report = $this->reportService->generateSystemReport();
                $this->writeSystemCsv($output, $report);
                break;
            case 'projects':
                $report = $this->reportService->generateProjectsReport($filters);
                $this->writeProjectsCsv($output, $report);
                break;
            case 'supervisors':
                $report = $this->reportService->generateSupervisorsReport($filters);
                $this->writeSupervisorsCsv($output, $report);
                break;
            case 'students':
                $report = $this->reportService->generateStudentsReport($filters);
                $this->writeStudentsCsv($output, $report);
                break;
            case 'requests':
                $report = $this->reportService->generateRequestsReport($filters);
                $this->writeRequestsCsv($output, $report);
                break;
            case 'deadlines':
                $report = $this->reportService->generateDeadlinesReport($filters);
                $this->writeDeadlinesCsv($output, $report);
                break;
        }

        rewind($output);
        $content = stream_get_contents($output);
        fclose($output);

        return $content;
    }

    protected function formatOverviewReport(array $report): string
    {
        $content = "OVERVIEW REPORT\n" . str_repeat('=', 50) . "\n\n";
        $kpis = $report['kpis'] ?? [];

        if (isset($kpis['users'])) {
            $content .= "Users:\n  Total: {$kpis['users']['total']}\n";
            foreach ($kpis['users']['byRole'] ?? [] as $role => $count) {
                $content .= "  {$role}: {$count}\n";
            }
            $content .= "\n";
        }

        if (isset($kpis['projects'])) {
            $content .= "Projects:\n  Total: {$kpis['projects']['total']}\n\n";
        }
        if (isset($kpis['students'])) {
            $content .= "Students: Total {$kpis['students']['total']}, Registered {$kpis['students']['registered']}, Unregistered {$kpis['students']['unregistered']}\n\n";
        }
        if (isset($kpis['evaluations'])) {
            $content .= "Evaluations: Total {$kpis['evaluations']['total']}, Average Grade {$kpis['evaluations']['averageGrade']}\n\n";
        }

        return $content;
    }

    protected function formatUsersReport(array $report): string
    {
        $content = "USERS REPORT\n" . str_repeat('=', 50) . "\n\n";
        $summary = $report['summary'] ?? [];
        $content .= "Summary: Total {$summary['total']}\n\n";

        foreach ($report['users'] ?? [] as $user) {
            $content .= "  - {$user['name']} ({$user['role']}) - {$user['status']}\n";
        }
        return $content;
    }

    protected function formatSystemReport(array $report): string
    {
        $content = "SYSTEM CONFIGURATION REPORT\n" . str_repeat('=', 50) . "\n\n";
        $summary = $report['summary'] ?? [];
        $content .= "Total Periods: {$summary['total_periods']}\n";
        $content .= "Active Periods: {$summary['active_periods']}\n\n";

        $content .= "Active Periods:\n";
        foreach ($report['active_periods'] ?? [] as $p) {
            $content .= "  - {$p['name']} ({$p['type']}): {$p['start_date']} to {$p['end_date']}\n";
        }
        return $content;
    }

    protected function formatProjectsReport(array $report): string
    {
        $content = "PROJECTS REPORT\n" . str_repeat('=', 50) . "\n\n";
        $summary = $report['summary'] ?? [];
        $content .= "Total: {$summary['total']}\n\n";
        foreach ($report['projects'] ?? [] as $project) {
            $content .= "  - " . ($project->title ?? $project['title'] ?? 'N/A') . "\n";
        }
        return $content;
    }

    protected function formatSupervisorsReport(array $report): string
    {
        $content = "SUPERVISORS REPORT\n" . str_repeat('=', 50) . "\n\n";
        $summary = $report['summary'] ?? [];
        $content .= "Total: {$summary['total']}, Projects: {$summary['total_projects']}, Students: {$summary['total_students']}\n\n";
        foreach ($report['supervisors'] ?? [] as $s) {
            $content .= "  - {$s['name']}: {$s['projects_count']} projects\n";
        }
        return $content;
    }

    protected function formatStudentsReport(array $report): string
    {
        $content = "STUDENTS REPORT\n" . str_repeat('=', 50) . "\n\n";
        $summary = $report['summary'] ?? [];
        $content .= "Total: {$summary['total']}, Registered: {$summary['registered']}, Unregistered: {$summary['unregistered']}\n\n";
        return $content;
    }

    protected function formatRequestsReport(array $report): string
    {
        $content = "REQUESTS REPORT\n" . str_repeat('=', 50) . "\n\n";
        $summary = $report['summary'] ?? [];
        $content .= "Total: {$summary['total']}, Approved: {$summary['approved']}, Rejected: {$summary['rejected']}, Pending: {$summary['pending']}\n\n";
        return $content;
    }

    protected function formatDeadlinesReport(array $report): string
    {
        $content = "DEADLINES REPORT\n" . str_repeat('=', 50) . "\n\n";
        $summary = $report['summary'] ?? [];
        $content .= "Total: {$summary['total']}, Completed: {$summary['completed']}, Overdue: {$summary['overdue']}\n\n";
        return $content;
    }

    protected function writeOverviewCsv($handle, array $report): void
    {
        fputcsv($handle, ['Report Type', 'Metric', 'Value']);
        $kpis = $report['kpis'] ?? [];
        if (isset($kpis['users'])) {
            fputcsv($handle, ['Users', 'Total', $kpis['users']['total']]);
            foreach ($kpis['users']['byRole'] ?? [] as $role => $count) {
                fputcsv($handle, ['Users', $role, $count]);
            }
        }
        if (isset($kpis['projects'])) {
            fputcsv($handle, ['Projects', 'Total', $kpis['projects']['total']]);
        }
    }

    protected function writeUsersCsv($handle, array $report): void
    {
        fputcsv($handle, ['Name', 'Email', 'Username', 'Role', 'Status', 'Department', 'Created At']);
        foreach ($report['users'] ?? [] as $user) {
            fputcsv($handle, [
                $user['name'],
                $user['email'] ?? '',
                $user['username'] ?? '',
                $user['role'],
                $user['status'],
                $user['department'] ?? '',
                $user['created_at'] ?? '',
            ]);
        }
    }

    protected function writeSystemCsv($handle, array $report): void
    {
        fputcsv($handle, ['Name', 'Type', 'Start Date', 'End Date', 'Academic Year']);
        foreach ($report['active_periods'] ?? [] as $p) {
            fputcsv($handle, [$p['name'], $p['type'], $p['start_date'], $p['end_date'], $p['academic_year'] ?? '']);
        }
    }

    protected function writeProjectsCsv($handle, array $report): void
    {
        fputcsv($handle, ['ID', 'Title', 'Status', 'Specialization', 'Supervisor', 'Students Count']);
        foreach ($report['projects'] ?? [] as $project) {
            $p = is_object($project) ? $project : (object) $project;
            fputcsv($handle, [
                $p->id ?? '',
                $p->title ?? '',
                $p->status ?? '',
                $p->specialization ?? '',
                $p->supervisor->name ?? (is_array($p->supervisor ?? null) ? ($p->supervisor['name'] ?? '') : ''),
                $p->current_students ?? 0,
            ]);
        }
    }

    protected function writeSupervisorsCsv($handle, array $report): void
    {
        fputcsv($handle, ['Name', 'Email', 'Department', 'Projects Count', 'Students Count', 'Average Grade', 'Pending Evaluations']);
        foreach ($report['supervisors'] ?? [] as $s) {
            fputcsv($handle, [
                $s['name'],
                $s['email'],
                $s['department'] ?? '',
                $s['projects_count'],
                $s['students_count'],
                $s['average_grade'] ?? '',
                $s['pending_evaluations'],
            ]);
        }
    }

    protected function writeStudentsCsv($handle, array $report): void
    {
        fputcsv($handle, ['Name', 'Student ID', 'Email', 'Department', 'Registered', 'Project', 'In Group']);
        foreach ($report['students'] ?? [] as $s) {
            fputcsv($handle, [
                $s['name'],
                $s['student_id'] ?? '',
                $s['email'],
                $s['department'] ?? '',
                $s['is_registered'] ? 'Yes' : 'No',
                $s['project_title'] ?? '',
                $s['is_in_group'] ? 'Yes' : 'No',
            ]);
        }
    }

    protected function writeRequestsCsv($handle, array $report): void
    {
        fputcsv($handle, ['ID', 'Type', 'Status', 'Student', 'Project', 'Created At']);
        foreach ($report['requests'] ?? [] as $req) {
            $r = is_object($req) ? $req : (object) $req;
            fputcsv($handle, [
                $r->id ?? '',
                $r->type ?? '',
                $r->status ?? '',
                $r->student->name ?? '',
                $r->project->title ?? '',
                $r->created_at ? (is_object($r->created_at) ? $r->created_at->format('Y-m-d H:i:s') : $r->created_at) : '',
            ]);
        }
    }

    protected function writeDeadlinesCsv($handle, array $report): void
    {
        fputcsv($handle, ['Project', 'Title', 'Due Date', 'Status', 'Completed At']);
        foreach ($report['overdue_milestones'] ?? [] as $m) {
            $milestone = is_object($m) ? $m : (object) $m;
            fputcsv($handle, [
                $milestone->project->title ?? '',
                $milestone->title ?? '',
                $milestone->due_date ? (is_object($milestone->due_date) ? $milestone->due_date->format('Y-m-d') : $milestone->due_date) : '',
                $milestone->completed ? 'Completed' : 'Overdue',
                $milestone->completed_at ? (is_object($milestone->completed_at) ? $milestone->completed_at->format('Y-m-d H:i:s') : $milestone->completed_at) : '',
            ]);
        }
    }

    protected function getFilename(string $reportType, string $extension): string
    {
        return 'admin_report_' . $reportType . '_' . now()->format('Y-m-d_His') . '.' . $extension;
    }
}
