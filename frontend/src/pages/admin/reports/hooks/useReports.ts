import { useQuery } from "@tanstack/react-query";
import { adminReportService, type ReportFilters } from "../api/report.service";

export function useAdminOverviewReport(filters?: ReportFilters) {
  return useQuery({
    queryKey: ["admin-reports", "overview", filters],
    queryFn: () => adminReportService.getOverview(filters),
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useAdminUsersReport(filters?: ReportFilters) {
  return useQuery({
    queryKey: ["admin-reports", "users", filters],
    queryFn: () => adminReportService.getUsers(filters),
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useAdminSystemReport() {
  return useQuery({
    queryKey: ["admin-reports", "system"],
    queryFn: () => adminReportService.getSystem(),
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useAdminProjectsReport(filters?: ReportFilters) {
  return useQuery({
    queryKey: ["admin-reports", "projects", filters],
    queryFn: () => adminReportService.getProjects(filters),
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useAdminSupervisorsReport(filters?: ReportFilters) {
  return useQuery({
    queryKey: ["admin-reports", "supervisors", filters],
    queryFn: () => adminReportService.getSupervisors(filters),
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useAdminStudentsReport(filters?: ReportFilters) {
  return useQuery({
    queryKey: ["admin-reports", "students", filters],
    queryFn: () => adminReportService.getStudents(filters),
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useAdminRequestsReport(filters?: ReportFilters) {
  return useQuery({
    queryKey: ["admin-reports", "requests", filters],
    queryFn: () => adminReportService.getRequests(filters),
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useAdminDeadlinesReport(filters?: ReportFilters) {
  return useQuery({
    queryKey: ["admin-reports", "deadlines", filters],
    queryFn: () => adminReportService.getDeadlines(filters),
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useAdminHistoryReport(periodsCount?: number) {
  return useQuery({
    queryKey: ["admin-reports", "history", periodsCount],
    queryFn: () => adminReportService.getHistory(periodsCount),
    staleTime: 0,
    refetchOnMount: true,
  });
}
