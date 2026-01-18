<?php

namespace App\Http\Controllers\ProjectsCommittee;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReportFiltersRequest;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class ReportExportController extends Controller
{
    public function __construct(
        protected ReportService $reportService
    ) {}

    /**
     * Export report as PDF
     */
    public function pdf(ReportFiltersRequest $request): \Illuminate\Http\Response
    {
        $reportType = $request->get('report', 'overview');
        $filters = $request->validated();
        unset($filters['report']); // Remove report type from filters

        // For now, return CSV as a simple text format until PDF library is installed
        // This can be enhanced later with dompdf
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
        unset($filters['report']);

        $content = $this->generateCsvReport($reportType, $filters);
        $filename = $this->getFilename($reportType, 'csv');

        return Response::make($content, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Generate text report content
     */
    protected function generateTextReport(string $reportType, array $filters): string
    {
        $content = "=== PROJECTS COMMITTEE REPORT ===\n";
        $content .= "Generated: " . now()->format('Y-m-d H:i:s') . "\n\n";

        switch ($reportType) {
            case 'overview':
                $report = $this->reportService->generateOverviewReport($filters);
                $content .= $this->formatOverviewReport($report);
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

    /**
     * Generate CSV report content
     */
    protected function generateCsvReport(string $reportType, array $filters): string
    {
        $output = fopen('php://temp', 'r+');

        switch ($reportType) {
            case 'overview':
                $report = $this->reportService->generateOverviewReport($filters);
                $this->writeOverviewCsv($output, $report);
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

    /**
     * Format overview report for text
     */
    protected function formatOverviewReport(array $report): string
    {
        $content = "OVERVIEW REPORT\n";
        $content .= str_repeat("=", 50) . "\n\n";

        $kpis = $report['kpis'] ?? [];
        
        if (isset($kpis['projects'])) {
            $content .= "Projects:\n";
            $content .= "  Total: {$kpis['projects']['total']}\n";
            foreach ($kpis['projects']['byStatus'] ?? [] as $status => $count) {
                $content .= "  {$status}: {$count}\n";
            }
            $content .= "\n";
        }

        if (isset($kpis['students'])) {
            $content .= "Students:\n";
            $content .= "  Total: {$kpis['students']['total']}\n";
            $content .= "  Registered: {$kpis['students']['registered']}\n";
            $content .= "  Unregistered: {$kpis['students']['unregistered']}\n\n";
        }

        if (isset($kpis['evaluations'])) {
            $content .= "Evaluations:\n";
            $content .= "  Total: {$kpis['evaluations']['total']}\n";
            $content .= "  Average Grade: {$kpis['evaluations']['averageGrade']}\n\n";
        }

        return $content;
    }

    /**
     * Format projects report for text
     */
    protected function formatProjectsReport(array $report): string
    {
        $content = "PROJECTS REPORT\n";
        $content .= str_repeat("=", 50) . "\n\n";

        $summary = $report['summary'] ?? [];
        $content .= "Summary:\n";
        $content .= "  Total: {$summary['total']}\n\n";

        $content .= "Projects:\n";
        foreach ($report['projects'] ?? [] as $project) {
            $content .= "  - {$project->title} ({$project->status})\n";
        }

        return $content;
    }

    /**
     * Format supervisors report for text
     */
    protected function formatSupervisorsReport(array $report): string
    {
        $content = "SUPERVISORS REPORT\n";
        $content .= str_repeat("=", 50) . "\n\n";

        $summary = $report['summary'] ?? [];
        $content .= "Summary:\n";
        $content .= "  Total Supervisors: {$summary['total']}\n";
        $content .= "  Total Projects: {$summary['total_projects']}\n";
        $content .= "  Total Students: {$summary['total_students']}\n\n";

        $content .= "Supervisors:\n";
        foreach ($report['supervisors'] ?? [] as $supervisor) {
            $content .= "  - {$supervisor['name']}: {$supervisor['projects_count']} projects, {$supervisor['students_count']} students\n";
        }

        return $content;
    }

    /**
     * Format students report for text
     */
    protected function formatStudentsReport(array $report): string
    {
        $content = "STUDENTS REPORT\n";
        $content .= str_repeat("=", 50) . "\n\n";

        $summary = $report['summary'] ?? [];
        $content .= "Summary:\n";
        $content .= "  Total: {$summary['total']}\n";
        $content .= "  Registered: {$summary['registered']}\n";
        $content .= "  Unregistered: {$summary['unregistered']}\n\n";

        return $content;
    }

    /**
     * Format requests report for text
     */
    protected function formatRequestsReport(array $report): string
    {
        $content = "REQUESTS REPORT\n";
        $content .= str_repeat("=", 50) . "\n\n";

        $summary = $report['summary'] ?? [];
        $content .= "Summary:\n";
        $content .= "  Total: {$summary['total']}\n";
        $content .= "  Approved: {$summary['approved']}\n";
        $content .= "  Rejected: {$summary['rejected']}\n";
        $content .= "  Pending: {$summary['pending']}\n";
        $content .= "  Approval Rate: {$summary['approval_rate']}%\n\n";

        return $content;
    }

    /**
     * Format deadlines report for text
     */
    protected function formatDeadlinesReport(array $report): string
    {
        $content = "DEADLINES REPORT\n";
        $content .= str_repeat("=", 50) . "\n\n";

        $summary = $report['summary'] ?? [];
        $content .= "Summary:\n";
        $content .= "  Total Milestones: {$summary['total']}\n";
        $content .= "  Completed: {$summary['completed']}\n";
        $content .= "  Overdue: {$summary['overdue']}\n";
        $content .= "  On Time: {$summary['on_time']}\n";
        $content .= "  Delayed: {$summary['delayed']}\n";
        $content .= "  Average Delay: {$summary['average_delay_days']} days\n\n";

        return $content;
    }

    /**
     * Write overview CSV
     */
    protected function writeOverviewCsv($handle, array $report): void
    {
        fputcsv($handle, ['Report Type', 'Metric', 'Value']);
        
        $kpis = $report['kpis'] ?? [];
        if (isset($kpis['projects'])) {
            fputcsv($handle, ['Projects', 'Total', $kpis['projects']['total']]);
            foreach ($kpis['projects']['byStatus'] ?? [] as $status => $count) {
                fputcsv($handle, ['Projects', $status, $count]);
            }
        }
        if (isset($kpis['students'])) {
            fputcsv($handle, ['Students', 'Total', $kpis['students']['total']]);
            fputcsv($handle, ['Students', 'Registered', $kpis['students']['registered']]);
            fputcsv($handle, ['Students', 'Unregistered', $kpis['students']['unregistered']]);
        }
    }

    /**
     * Write projects CSV
     */
    protected function writeProjectsCsv($handle, array $report): void
    {
        fputcsv($handle, ['ID', 'Title', 'Status', 'Specialization', 'Supervisor', 'Students Count']);
        
        foreach ($report['projects'] ?? [] as $project) {
            fputcsv($handle, [
                $project->id,
                $project->title,
                $project->status,
                $project->specialization ?? '',
                $project->supervisor->name ?? '',
                $project->current_students ?? 0,
            ]);
        }
    }

    /**
     * Write supervisors CSV
     */
    protected function writeSupervisorsCsv($handle, array $report): void
    {
        fputcsv($handle, ['Name', 'Email', 'Department', 'Projects Count', 'Students Count', 'Average Grade', 'Pending Evaluations']);
        
        foreach ($report['supervisors'] ?? [] as $supervisor) {
            fputcsv($handle, [
                $supervisor['name'],
                $supervisor['email'],
                $supervisor['department'] ?? '',
                $supervisor['projects_count'],
                $supervisor['students_count'],
                $supervisor['average_grade'] ?? '',
                $supervisor['pending_evaluations'],
            ]);
        }
    }

    /**
     * Write students CSV
     */
    protected function writeStudentsCsv($handle, array $report): void
    {
        fputcsv($handle, ['Name', 'Student ID', 'Email', 'Department', 'Registered', 'Project', 'In Group']);
        
        foreach ($report['students'] ?? [] as $student) {
            fputcsv($handle, [
                $student['name'],
                $student['student_id'] ?? '',
                $student['email'],
                $student['department'] ?? '',
                $student['is_registered'] ? 'Yes' : 'No',
                $student['project_title'] ?? '',
                $student['is_in_group'] ? 'Yes' : 'No',
            ]);
        }
    }

    /**
     * Write requests CSV
     */
    protected function writeRequestsCsv($handle, array $report): void
    {
        fputcsv($handle, ['ID', 'Type', 'Status', 'Student', 'Project', 'Created At']);
        
        foreach ($report['requests'] ?? [] as $request) {
            fputcsv($handle, [
                $request->id,
                $request->type,
                $request->status,
                $request->student->name ?? '',
                $request->project->title ?? '',
                $request->created_at->format('Y-m-d H:i:s'),
            ]);
        }
    }

    /**
     * Write deadlines CSV
     */
    protected function writeDeadlinesCsv($handle, array $report): void
    {
        fputcsv($handle, ['Project', 'Title', 'Due Date', 'Status', 'Completed At']);
        
        foreach ($report['overdue_milestones'] ?? [] as $milestone) {
            fputcsv($handle, [
                $milestone->project->title ?? '',
                $milestone->title,
                $milestone->due_date->format('Y-m-d'),
                $milestone->completed ? 'Completed' : 'Overdue',
                $milestone->completed_at ? $milestone->completed_at->format('Y-m-d H:i:s') : '',
            ]);
        }
    }

    /**
     * Get filename for export
     */
    protected function getFilename(string $reportType, string $extension): string
    {
        $timestamp = now()->format('Y-m-d_His');
        return "report_{$reportType}_{$timestamp}.{$extension}";
    }
}
