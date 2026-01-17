import { useQuery } from '@tanstack/react-query'
import { committeeReportService, type ReportFilters, type OverviewReport, type ProjectsReport, type SupervisorsReport, type StudentsReport, type RequestsReport, type DeadlinesReport, type HistoryReport } from '../api/report.service'

export function useProjectsReport() {
  return useQuery({
    queryKey: ['committee-reports', 'projects'],
    queryFn: () => committeeReportService.generateProjectsReport(),
  })
}

export function useOverviewReport(filters?: ReportFilters) {
  return useQuery({
    queryKey: ['committee-reports', 'overview', filters],
    queryFn: async () => {
      try {
        const result = await committeeReportService.getOverview(filters)
        if (!result) {
          throw new Error('No data returned')
        }
        return result
      } catch (error) {
        console.error('Error fetching overview report:', error)
        return {
          kpis: {
            projects: { total: 0, byStatus: {} },
            proposals: { total: 0, byStatus: {} },
            requests: { total: 0, byStatus: {} },
            students: { total: 0, registered: 0, unregistered: 0 },
            evaluations: { total: 0, averageGrade: 0 },
            milestones: { total: 0, completed: 0, overdue: 0 },
          },
          charts: [],
        }
      }
    },
  })
}

export function useProjectsReportData(filters?: ReportFilters & { page?: number; pageSize?: number; search?: string; sortBy?: string; sortOrder?: string }) {
  return useQuery({
    queryKey: ['committee-reports', 'projects-data', filters],
    queryFn: () => committeeReportService.getProjects(filters),
  })
}

export function useSupervisorsReport(filters?: ReportFilters & { page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: ['committee-reports', 'supervisors', filters],
    queryFn: () => committeeReportService.getSupervisors(filters),
  })
}

export function useStudentsReport(filters?: ReportFilters & { page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: ['committee-reports', 'students', filters],
    queryFn: () => committeeReportService.getStudents(filters),
  })
}

export function useRequestsReport(filters?: ReportFilters & { page?: number; pageSize?: number; search?: string; sortBy?: string; sortOrder?: string }) {
  return useQuery({
    queryKey: ['committee-reports', 'requests', filters],
    queryFn: () => committeeReportService.getRequests(filters),
  })
}

export function useDeadlinesReport(filters?: ReportFilters & { page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: ['committee-reports', 'deadlines', filters],
    queryFn: () => committeeReportService.getDeadlines(filters),
  })
}

export function useHistoryReport(periodsCount?: number) {
  return useQuery({
    queryKey: ['committee-reports', 'history', periodsCount],
    queryFn: () => committeeReportService.getHistory(periodsCount),
  })
}
