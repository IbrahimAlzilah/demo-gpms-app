import { apiClient } from "../../../../../lib/axios";

export interface ReportData {
  projects: {
    total: number;
    byStatus: Record<string, number>;
  };
  proposals: {
    total: number;
    byStatus: Record<string, number>;
  };
  requests: {
    total: number;
    byStatus: Record<string, number>;
  };
  evaluations: {
    total: number;
    averageGrade: number;
  };
  students: {
    total: number;
    registered: number;
    unregistered: number;
  };
}

export interface ReportFilters {
  period_id?: number;
  date_from?: string;
  date_to?: string;
  status?: string;
  supervisor_id?: number;
  project_specialization?: string;
  department?: string;
  request_status?: string;
  request_type?: string;
}

export interface OverviewReport {
  kpis: {
    projects: {
      total: number;
      byStatus: Record<string, number>;
    };
    proposals: {
      total: number;
      byStatus: Record<string, number>;
    };
    requests: {
      total: number;
      byStatus: Record<string, number>;
    };
    students: {
      total: number;
      registered: number;
      unregistered: number;
      by_defense_status?: Record<string, number>;
    };
    evaluations: {
      total: number;
      averageGrade: number;
    };
    milestones: {
      total: number;
      completed: number;
      overdue: number;
    };
  };
}

export interface ProjectsReport {
  summary: {
    total: number;
    byStatus: Record<string, number>;
    byPhase: Record<string, number>;
    bySpecialization: Record<string, number>;
  };
  projects: any[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface SupervisorsReport {
  summary: {
    total: number;
    total_projects: number;
    total_students: number;
  };
  supervisors: Array<{
    id: number;
    name: string;
    email: string;
    department: string | null;
    projects_count: number;
    students_count: number;
    by_status?: Record<string, number>;
    average_grade: number | null;
    pending_evaluations: number;
    project_titles?: string[];
  }>;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export type DefenseStatus = "completed" | "ready_for_fd2" | "ready_for_fd1" | "in_progress";

export interface StudentsReport {
  summary: {
    total: number;
    registered: number;
    unregistered: number;
    in_groups: number;
    by_defense_status?: Record<string, number>;
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
    group_name?: string | null;
    supervisor_name?: string | null;
    defense_status: DefenseStatus;
    fd1_approved?: boolean;
    fd2_approved?: boolean;
  }>;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
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
  requests: any[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
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
  overdue_milestones: any[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface HistoryReport {
  periods: Array<{
    period_id: number;
    period_name: string;
    academic_year: string | null;
    semester: string | null;
    start_date: string;
    end_date: string;
    kpis: any;
  }>;
}

export interface StudentGroupMember {
  id: number;
  name: string | null;
  student_id: string | null;
  defense_status: DefenseStatus;
  fd1_approved?: boolean;
  fd2_approved?: boolean;
}

export interface StudentGroupsReport {
  summary: {
    total: number;
    by_readiness?: Record<string, number>;
  };
  groups: Array<{
    id: number;
    name: string | null;
    group_code: string;
    leader_id: number;
    leader_name: string | null;
    member_count: number;
    member_names: string[];
    members: StudentGroupMember[];
    overall_readiness: string;
    project_id: number | null;
    project_title: string | null;
    supervisor_name: string | null;
  }>;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface DiscussionCommitteesReport {
  summary: { total: number; total_committee_members?: number };
  projects: Array<{
    id: number;
    title: string;
    status: string;
    supervisor_name: string | null;
    committee_member_names: string[];
    committee_member_emails?: string[];
    fd1_status: string;
    fd2_status: string;
    students_count: number;
  }>;
  member_workload?: Array<{
    id: number;
    name: string;
    email: string | null;
    projects_count: number;
    projects: Array<{ project_id: number; title: string; fd1_status: string; fd2_status: string }>;
  }>;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const committeeReportService = {
  // Legacy endpoint
  generateProjectsReport: async (): Promise<ReportData> => {
    const response = await apiClient.get<ReportData>(
      "/projects-committee/reports",
    );
    // Axios interceptor already extracts data.data to data
    return response.data;
  },

  // New filterable endpoints
  getOverview: async (filters?: ReportFilters): Promise<OverviewReport> => {
    try {
      const response = await apiClient.get<OverviewReport>(
        "/projects-committee/reports/overview",
        { params: filters },
      );
      // Axios interceptor already extracts data.data to data
      return (
        response.data || {
          kpis: {
            projects: { total: 0, byStatus: {} },
            proposals: { total: 0, byStatus: {} },
            requests: { total: 0, byStatus: {} },
            students: { total: 0, registered: 0, unregistered: 0, by_defense_status: {} },
            evaluations: { total: 0, averageGrade: 0 },
            milestones: { total: 0, completed: 0, overdue: 0 },
          },
        }
      );
    } catch (error) {
      console.error("Error fetching overview report:", error);
      return {
        kpis: {
          projects: { total: 0, byStatus: {} },
          proposals: { total: 0, byStatus: {} },
          requests: { total: 0, byStatus: {} },
          students: { total: 0, registered: 0, unregistered: 0, by_defense_status: {} },
          evaluations: { total: 0, averageGrade: 0 },
          milestones: { total: 0, completed: 0, overdue: 0 },
        },
      };
    }
  },

  getProjects: async (
    filters?: ReportFilters & {
      page?: number;
      pageSize?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: string;
    },
  ): Promise<ProjectsReport> => {
    const response = await apiClient.get<ProjectsReport>(
      "/projects-committee/reports/projects",
      { params: filters },
    );
    // Axios interceptor already extracts data.data to data
    return response.data;
  },

  getSupervisors: async (
    filters?: ReportFilters & { page?: number; pageSize?: number },
  ): Promise<SupervisorsReport> => {
    const response = await apiClient.get<SupervisorsReport>(
      "/projects-committee/reports/supervisors",
      { params: filters },
    );
    return response.data;
  },

  getStudents: async (
    filters?: ReportFilters & { page?: number; pageSize?: number },
  ): Promise<StudentsReport> => {
    const response = await apiClient.get<StudentsReport>(
      "/projects-committee/reports/students",
      { params: filters },
    );
    return response.data;
  },

  getRequests: async (
    filters?: ReportFilters & {
      page?: number;
      pageSize?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: string;
    },
  ): Promise<RequestsReport> => {
    const response = await apiClient.get<RequestsReport>(
      "/projects-committee/reports/requests",
      { params: filters },
    );
    return response.data;
  },

  getDeadlines: async (
    filters?: ReportFilters & { page?: number; pageSize?: number },
  ): Promise<DeadlinesReport> => {
    const response = await apiClient.get<DeadlinesReport>(
      "/projects-committee/reports/deadlines",
      { params: filters },
    );
    return response.data;
  },

  getHistory: async (periodsCount?: number): Promise<HistoryReport> => {
    const response = await apiClient.get<HistoryReport>(
      "/projects-committee/reports/history",
      { params: { periods_count: periodsCount } },
    );
    return response.data;
  },

  getStudentGroups: async (
    filters?: ReportFilters & { page?: number; pageSize?: number },
  ): Promise<StudentGroupsReport> => {
    const response = await apiClient.get<StudentGroupsReport>(
      "/projects-committee/reports/student-groups",
      { params: filters },
    );
    return response.data;
  },

  getDiscussionCommittees: async (
    filters?: ReportFilters & { page?: number; pageSize?: number },
  ): Promise<DiscussionCommitteesReport> => {
    const response = await apiClient.get<DiscussionCommitteesReport>(
      "/projects-committee/reports/discussion-committees",
      { params: filters },
    );
    return response.data;
  },

  // Export endpoints
  exportPdf: async (
    reportType: string,
    filters?: ReportFilters,
  ): Promise<Blob> => {
    const response = await apiClient.get(
      `/projects-committee/reports/export/pdf`,
      {
        params: { report: reportType, ...filters },
        responseType: "blob",
      },
    );
    return response.data;
  },

  exportExcel: async (
    reportType: string,
    filters?: ReportFilters,
  ): Promise<Blob> => {
    const response = await apiClient.get(
      `/projects-committee/reports/export/excel`,
      {
        params: { report: reportType, ...filters },
        responseType: "blob",
      },
    );
    return response.data;
  },
};
