import { apiClient } from "../../../../../lib/axios";
import type {
  ProjectRegistration,
  GroupRegistrationRequest,
  Proposal,
} from "../../../../../types/project.types";
import type {
  TableQueryParams,
  TableResponse,
} from "../../../../../types/table.types";

export interface RegistrationListParams {
  status?: "pending" | "approved" | "rejected";
  project_id?: string;
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface ApproveRegistrationParams {
  comments?: string;
}

export interface RejectRegistrationParams {
  comments: string;
}

export const registrationService = {
  getAll: async (
    params?: RegistrationListParams,
  ): Promise<{
    data: ProjectRegistration[];
    pagination?: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.project_id) queryParams.append("project_id", params.project_id);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.pageSize)
      queryParams.append("pageSize", params.pageSize.toString());
    if (params?.search) queryParams.append("search", params.search);

    const response = await apiClient.get<{
      data: ProjectRegistration[];
      pagination?: {
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
      };
    }>(`/projects-committee/registrations?${queryParams.toString()}`);
    return response.data;
  },

  getTableData: async (
    params?: TableQueryParams,
  ): Promise<TableResponse<ProjectRegistration>> => {
    const queryParams = new URLSearchParams();

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

    const response = await apiClient.get<ProjectRegistration[]>(
      `/projects-committee/registrations?${queryParams.toString()}`,
    );

    return {
      data: Array.isArray(response.data) ? response.data : [],
      totalCount: response.pagination?.total || 0,
      page: response.pagination?.current_page || 1,
      pageSize: response.pagination?.per_page || 10,
      totalPages: response.pagination?.last_page || 0,
    };
  },

  getById: async (id: string): Promise<ProjectRegistration> => {
    const response = await apiClient.get<ProjectRegistration>(
      `/projects-committee/registrations/${id}`,
    );
    return response.data;
  },

  approve: async (
    registrationId: string,
    params?: ApproveRegistrationParams,
  ): Promise<ProjectRegistration> => {
    const response = await apiClient.post<ProjectRegistration>(
      `/projects-committee/registrations/${registrationId}/approve`,
      params,
    );
    return response.data;
  },

  reject: async (
    registrationId: string,
    params: RejectRegistrationParams,
  ): Promise<ProjectRegistration> => {
    const response = await apiClient.post<ProjectRegistration>(
      `/projects-committee/registrations/${registrationId}/reject`,
      params,
    );
    return response.data;
  },

  getByStudentId: async (studentId: string): Promise<ProjectRegistration[]> => {
    const queryParams = new URLSearchParams();
    queryParams.append("page", "1");
    queryParams.append("pageSize", "100"); // Get all registrations for the student
    queryParams.append("filters[student_id]", studentId);

    const response = await apiClient.get<ProjectRegistration[]>(
      `/projects-committee/registrations?${queryParams.toString()}`,
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Manually register a student group to a project
   * Project Committee can register students/groups without time window restrictions
   */
  create: async (data: {
    projectId: string;
    studentGroupId: string;
    autoApprove?: boolean;
  }): Promise<ProjectRegistration> => {
    const response = await apiClient.post<ProjectRegistration>(
      "/projects-committee/registrations",
      {
        project_id: data.projectId,
        student_group_id: data.studentGroupId,
        auto_approve: data.autoApprove ?? true,
      },
    );
    return response.data;
  },

  /**
   * Get grouped registration requests
   */
  getGroupedRequests: async (params?: {
    status?: string;
    page?: number;
    pageSize?: number;
    search?: string;
  }): Promise<{
    data: GroupRegistrationRequest[];
    pagination?: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  }> => {
    const queryParams = new URLSearchParams();
    queryParams.append("grouped", "true");
    if (params?.status) queryParams.append("status", params.status);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.pageSize)
      queryParams.append("pageSize", params.pageSize.toString());
    if (params?.search) queryParams.append("search", params.search);

    const response = await apiClient.get(
      `/projects-committee/registrations?${queryParams.toString()}`,
    );

    // Axios interceptor extracts response.data.data to response.data
    // and response.data.pagination to response.pagination
    // So response.data is the array, and response.pagination is the pagination object
    return {
      data: Array.isArray(response.data) ? response.data : [],
      pagination: (response as any).pagination,
    };
  },

  /**
   * Get unified group data with proposals and registrations
   */
  getUnifiedGroups: async (params?: {
    status?: string;
    page?: number;
    pageSize?: number;
    search?: string;
    project_id?: string;
  }): Promise<{
    data: UnifiedGroup[];
    pagination?: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.pageSize)
      queryParams.append("pageSize", params.pageSize.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.project_id) queryParams.append("project_id", params.project_id);

    const response = await apiClient.get(
      `/projects-committee/registrations/unified-groups?${queryParams.toString()}`,
    );

    // Support both shapes:
    // - With interceptor: response.data is already the array, response.pagination holds meta
    // - Without interceptor: response.data is { data: [...], pagination: {...} }
    const raw = (response as any).data;
    const dataArray = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)
        ? raw.data
        : [];

    const pagination =
      (response as any).pagination ??
      (raw && typeof raw === "object" && "pagination" in raw ? (raw as any).pagination : undefined);

    return {
      data: dataArray,
      pagination,
    };
  },
};

export interface UnifiedGroup {
  id: string;
  group: any; // StudentGroup
  proposals: Proposal[];
  registrationRequests: GroupRegistrationRequest[];
  approvedProject: any | null; // Project
  hasPendingProposals: boolean;
  hasPendingRegistrations: boolean;
  totalProposals: number;
  totalRegistrationRequests: number;
  canApproveNewProject: boolean;
}
