import { apiClient } from "../../../../../lib/axios";
import type { Grade } from "@/types/evaluation.types";
import type {
  TableQueryParams,
  TableResponse,
} from "../../../../../types/table.types";

export interface GradeListParams {
  is_approved?: boolean;
  project_id?: string;
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface ApproveGradeParams {
  comments?: string;
}

export const committeeGradeService = {
  getAll: async (
    params?: GradeListParams,
  ): Promise<{
    data: Grade[];
    pagination?: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.is_approved !== undefined)
      queryParams.append("is_approved", String(params.is_approved));
    if (params?.project_id) queryParams.append("project_id", params.project_id);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.pageSize)
      queryParams.append("pageSize", params.pageSize.toString());
    if (params?.search) queryParams.append("search", params.search);

    const response = await apiClient.get<{
      data: Grade[];
      pagination?: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
      };
    }>(`/projects-committee/grades?${queryParams.toString()}`);
    return response.data;
  },

  getTableData: async (
    params?: TableQueryParams,
    isApproved?: boolean,
  ): Promise<TableResponse<Grade>> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.pageSize)
      queryParams.append("pageSize", params.pageSize.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);
    if (params?.search) queryParams.append("search", params.search);
    if (isApproved !== undefined)
      queryParams.append("is_approved", String(isApproved));
    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          queryParams.append(`filters[${key}]`, String(value));
        }
      });
    }

    const response = await apiClient.get<Grade[]>(
      `/projects-committee/grades?${queryParams.toString()}`,
    );

    return {
      data: Array.isArray(response.data) ? response.data : [],
      totalCount: response.pagination?.total || 0,
      page: response.pagination?.page || 1,
      pageSize: response.pagination?.pageSize || 10,
      totalPages: response.pagination?.totalPages || 0,
    };
  },

  getById: async (id: string): Promise<Grade> => {
    const response = await apiClient.get<Grade>(
      `/projects-committee/grades/${id}`,
    );
    return response.data;
  },

  approve: async (
    gradeId: string,
    params?: ApproveGradeParams,
  ): Promise<Grade> => {
    const response = await apiClient.post<Grade>(
      `/projects-committee/grades/${gradeId}/approve`,
      params,
    );
    return response.data;
  },

  update: async (
    gradeId: string,
    data: {
      supervisorScore?: number;
      committeeScore?: number;
      finalGrade?: number;
      fd1FinalGrade?: number;
      fd2FinalGrade?: number;
    },
  ): Promise<Grade> => {
    // Map to API structure
    const payload: any = {};
    if (data.supervisorScore !== undefined) {
      payload.supervisor_grade = { score: data.supervisorScore };
    }
    if (data.committeeScore !== undefined) {
      payload.committee_grade = { score: data.committeeScore };
    }
    if (data.finalGrade !== undefined) {
      payload.final_grade = data.finalGrade;
    }
    if (data.fd1FinalGrade !== undefined) {
      payload.fd1_final_grade = data.fd1FinalGrade;
    }
    if (data.fd2FinalGrade !== undefined) {
      payload.fd2_final_grade = data.fd2FinalGrade;
    }

    const response = await apiClient.put<{ data: Grade }>(
      `/projects-committee/grades/${gradeId}`,
      payload,
    );
    return response.data.data;
  },

  /**
   * Publish approved grades to students (notify; marks FD stage complete)
   */
  publish: async (gradeIds: string[]): Promise<{ publishedCount: number }> => {
    const response = await apiClient.post<{ publishedCount: number }>(
      "/projects-committee/grades/publish",
      { grade_ids: gradeIds },
    );
    return response.data;
  },

  /**
   * Approve a specific defense stage (FD1 / FD2)
   */
  approveDefenseStage: async (
    projectId: string,
    stage: "fd1" | "fd2",
  ): Promise<void> => {
    await apiClient.post(
      `/projects-committee/defense-approvals/${projectId}/approve/${stage}`,
    );
  },

  /**
   * Publish results for a specific defense stage
   */
  publishDefenseResults: async (
    projectId: string,
    stage: "fd1" | "fd2",
  ): Promise<void> => {
    await apiClient.post(
      `/projects-committee/defense-approvals/${projectId}/publish/${stage}`,
    );
  },

  /**
   * Get all evaluations for a project stage (for review)
   */
  getDefenseReview: async (
    projectId: string,
    stage: "fd1" | "fd2",
  ): Promise<any[]> => {
    const response = await apiClient.get<any[]>(
      `/projects-committee/defense-evaluations/${projectId}/review/${stage}`,
    );
    return Array.isArray(response.data) ? response.data : [];
  },
};
