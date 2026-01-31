import { apiClient } from "../../../../lib/axios";

export interface ReportFilters {
  period_id?: number;
  date_from?: string;
  date_to?: string;
  status?: string;
  role?: string;
  supervisor_id?: number;
  project_specialization?: string;
  department?: string;
  request_status?: string;
  request_type?: string;
}

export interface AdminOverviewReport {
  kpis: {
    projects: { total: number; byStatus: Record<string, number> };
    proposals: { total: number; byStatus: Record<string, number> };
    requests: { total: number; byStatus: Record<string, number> };
    students: { total: number; registered: number; unregistered: number };
    evaluations: { total: number; averageGrade: number };
    milestones: { total: number; completed: number; overdue: number };
    users: {
      total: number;
      byRole: Record<string, number>;
      byStatus: Record<string, number>;
    };
  };
  charts: Array<{ month: string; label: string; data: Record<string, number> }>;
}

export interface UsersReport {
  summary: {
    total: number;
    byRole: Record<string, number>;
    byStatus: Record<string, number>;
  };
  users: Array<{
    id: number;
    name: string;
    email: string | null;
    username: string;
    role: string;
    status: string;
    student_id: string | null;
    emp_id: string | null;
    department: string | null;
    created_at: string;
  }>;
}

export interface SystemReport {
  summary: {
    total_periods: number;
    active_periods: number;
    upcoming_periods: number;
    byType: Record<
      string,
      { total: number; active: number; scheduled: number; ended: number }
    >;
  };
  active_periods: Array<{
    id: number;
    name: string;
    type: string;
    start_date: string;
    end_date: string;
    academic_year: string | null;
    semester: string | null;
  }>;
  upcoming_periods: Array<{
    id: number;
    name: string;
    type: string;
    start_date: string;
    end_date: string;
  }>;
}

export interface ProjectsReport {
  summary: {
    total: number;
    byStatus: Record<string, number>;
    byPhase: Record<string, number>;
    bySpecialization: Record<string, number>;
  };
  projects: unknown[];
}

export interface SupervisorsReport {
  summary: { total: number; total_projects: number; total_students: number };
  supervisors: Array<{
    id: number;
    name: string;
    email: string;
    department: string | null;
    projects_count: number;
    students_count: number;
    average_grade: number | null;
    pending_evaluations: number;
  }>;
}

export interface StudentsReport {
  summary: {
    total: number;
    registered: number;
    unregistered: number;
    in_groups: number;
  };
  students: Array<{
    id: number;
    name: string;
    student_id: string | null;
    email: string;
    department: string | null;
    is_registered: boolean;
    project_id: number | null;
    project_title: string | null;
    is_in_group: boolean;
    group_id: number | null;
  }>;
}

export interface RequestsReport {
  summary: {
    total: number;
    approved: number;
    rejected: number;
    pending: number;
    approval_rate: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
  };
  requests: unknown[];
}

export interface DeadlinesReport {
  summary: {
    total: number;
    completed: number;
    overdue: number;
    on_time: number;
    delayed: number;
    average_delay_days: number;
  };
  overdue_milestones: unknown[];
}

export interface HistoryReport {
  periods: Array<{
    period_id: number;
    period_name: string;
    academic_year: string | null;
    semester: string | null;
    start_date: string;
    end_date: string;
    kpis: unknown;
  }>;
}

export const adminReportService = {
  getOverview: async (
    filters?: ReportFilters,
  ): Promise<AdminOverviewReport> => {
    const response = await apiClient.get<AdminOverviewReport>(
      "/admin/reports/overview",
      { params: filters },
    );
    return response.data;
  },

  getUsers: async (filters?: ReportFilters): Promise<UsersReport> => {
    const response = await apiClient.get<UsersReport>("/admin/reports/users", {
      params: filters,
    });
    return response.data;
  },

  getSystem: async (): Promise<SystemReport> => {
    const response = await apiClient.get<SystemReport>("/admin/reports/system");
    return response.data;
  },

  getProjects: async (filters?: ReportFilters): Promise<ProjectsReport> => {
    const response = await apiClient.get<ProjectsReport>(
      "/admin/reports/projects",
      { params: filters },
    );
    return response.data;
  },

  getSupervisors: async (
    filters?: ReportFilters,
  ): Promise<SupervisorsReport> => {
    const response = await apiClient.get<SupervisorsReport>(
      "/admin/reports/supervisors",
      { params: filters },
    );
    return response.data;
  },

  getStudents: async (filters?: ReportFilters): Promise<StudentsReport> => {
    const response = await apiClient.get<StudentsReport>(
      "/admin/reports/students",
      { params: filters },
    );
    return response.data;
  },

  getRequests: async (filters?: ReportFilters): Promise<RequestsReport> => {
    const response = await apiClient.get<RequestsReport>(
      "/admin/reports/requests",
      { params: filters },
    );
    return response.data;
  },

  getDeadlines: async (filters?: ReportFilters): Promise<DeadlinesReport> => {
    const response = await apiClient.get<DeadlinesReport>(
      "/admin/reports/deadlines",
      { params: filters },
    );
    return response.data;
  },

  getHistory: async (periodsCount?: number): Promise<HistoryReport> => {
    const response = await apiClient.get<HistoryReport>(
      "/admin/reports/history",
      {
        params: { periods_count: periodsCount },
      },
    );
    return response.data;
  },

  exportPdf: async (
    reportType: string,
    filters?: ReportFilters,
  ): Promise<Blob> => {
    const response = await apiClient.get(`/admin/reports/export/pdf`, {
      params: { report: reportType, ...filters },
      responseType: "blob",
    });
    return response.data as Blob;
  },

  exportExcel: async (
    reportType: string,
    filters?: ReportFilters,
  ): Promise<Blob> => {
    const response = await apiClient.get(`/admin/reports/export/excel`, {
      params: { report: reportType, ...filters },
      responseType: "blob",
    });
    return response.data as Blob;
  },
};
