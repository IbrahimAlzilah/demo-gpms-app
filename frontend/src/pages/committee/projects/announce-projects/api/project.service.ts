import { apiClient } from "../../../../../lib/axios";
import type {
  Project,
  ProjectStatus,
} from "../../../../../types/project.types";
import type {
  TableQueryParams,
  TableResponse,
} from "../../../../../types/table.types";

export interface ProjectStatistics {
  total: number;
  byStatus: {
    draft: number;
    available_for_registration: number;
    in_progress: number;
    completed: number;
    archived: number;
  };
  withSupervisor: number;
  withoutSupervisor: number;
  withGroup: number;
  recentActivity: {
    newThisWeek: number;
    updatedThisWeek: number;
  };
}

export interface WorkflowPhase {
  name: string;
  title: string;
  status: "pending" | "in_progress" | "completed";
  details: Record<string, unknown>;
}

export interface ProjectWorkflow {
  project: Project;
  phases: WorkflowPhase[];
  overallProgress: number;
}

export interface ProjectDetailStatistics {
  documentsCount: number;
  documentsByStatus: {
    pending: number;
    approved: number;
    rejected: number;
  };
  gradesCount: number;
  approvedGrades: number;
  milestonesCount: number;
  completedMilestones: number;
  meetingsCount: number;
  notesCount: number;
  requestsCount: number;
  pendingRequests: number;
}

export interface ProjectDetailsResponse {
  data: Project;
  statistics?: ProjectDetailStatistics | null;
}

export interface UpdateProjectPayload {
  title?: string;
  description?: string;
  max_students?: number;
  specialization?: string;
  keywords?: string[];
  supervisor_id?: string | null;
}

export interface UpdateProjectStatusPayload {
  status: ProjectStatus;
  notify_students?: boolean;
}

export const committeeProjectService = {
  getAll: async (): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>(
      "/projects-committee/projects",
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  getDraft: async (): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>(
      "/projects-committee/projects?status=draft&pageSize=1000",
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  getTableData: async (
    params?: TableQueryParams,
    status?: string,
  ): Promise<TableResponse<Project>> => {
    const queryParams = new URLSearchParams();

    if (status) queryParams.append("status", status);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.pageSize)
      queryParams.append("pageSize", params.pageSize.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          queryParams.append(`filters[${key}]`, String(value));
        }
      });
    }

    const response = await apiClient.get<Project[]>(
      `/projects-committee/projects?${queryParams.toString()}`,
    );

    return {
      data: Array.isArray(response.data) ? response.data : [],
      totalCount: response.pagination?.total || 0,
      page: response.pagination?.page || 1,
      pageSize: response.pagination?.pageSize || 10,
      totalPages: response.pagination?.totalPages || 0,
    };
  },

  getById: async (id: string): Promise<ProjectDetailsResponse | null> => {
    try {
      const response = (await apiClient.get<Project>(
        `/projects-committee/projects/${id}`,
      )) as {
        data: Project;
        statistics?: ProjectDetailStatistics;
      };
      // Interceptor puts project in response.data and preserves statistics on response
      const project = response.data;
      const statistics =
        "statistics" in response ? response.statistics : undefined;
      if (!project || typeof project !== "object") return null;
      return { data: project as Project, statistics: statistics ?? undefined };
    } catch {
      return null;
    }
  },

  /**
   * Get comprehensive project statistics
   */
  getStatistics: async (): Promise<ProjectStatistics> => {
    const response = await apiClient.get<{
      success: boolean;
      data: ProjectStatistics;
    }>("/projects-committee/projects/statistics");
    return (
      response.data.data || (response.data as unknown as ProjectStatistics)
    );
  },

  /**
   * Get project workflow with all phases
   */
  getWorkflow: async (projectId: string): Promise<ProjectWorkflow> => {
    const response = await apiClient.get<{
      success: boolean;
      data: ProjectWorkflow;
    }>(`/projects-committee/projects/${projectId}/workflow`);
    return response.data.data || (response.data as unknown as ProjectWorkflow);
  },

  /**
   * Update project details
   */
  update: async (
    projectId: string,
    payload: UpdateProjectPayload,
  ): Promise<Project> => {
    const response = await apiClient.put<{ success: boolean; data: Project }>(
      `/projects-committee/projects/${projectId}`,
      payload,
    );
    return response.data.data || (response.data as unknown as Project);
  },

  /**
   * Update project status
   */
  updateStatus: async (
    projectId: string,
    payload: UpdateProjectStatusPayload,
  ): Promise<Project> => {
    const response = await apiClient.put<{ success: boolean; data: Project }>(
      `/projects-committee/projects/${projectId}/status`,
      payload,
    );
    return response.data.data || (response.data as unknown as Project);
  },

  /**
   * Delete a project (only non-active projects)
   */
  delete: async (projectId: string): Promise<void> => {
    await apiClient.delete(`/projects-committee/projects/${projectId}`);
  },

  announce: async (projectIds: string[]): Promise<void> => {
    await apiClient.post("/projects-committee/projects/announce", {
      project_ids: projectIds,
    });
  },

  unannounce: async (projectIds: string[]): Promise<void> => {
    await apiClient.post("/projects-committee/projects/unannounce", {
      project_ids: projectIds,
    });
  },
};
