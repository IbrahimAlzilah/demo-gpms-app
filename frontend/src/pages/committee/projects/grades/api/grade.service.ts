import { apiClient } from "../../../../../lib/axios";
import type { Grade } from "@/types/evaluation.types";
import type {
  TableQueryParams,
  TableResponse,
} from "../../../../../types/table.types";

export interface GradeListParams {
  is_approved?: boolean;
  project_id?: string;
  stage?: 'fd1' | 'fd2';
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

    const response = await apiClient.get<Grade[] | { data?: Grade[] }>(
      `/projects-committee/grades?${queryParams.toString()}`,
    );

    const raw = response.data;
    const grades = Array.isArray(raw)
      ? raw
      : Array.isArray((raw as { data?: Grade[] })?.data)
        ? (raw as { data: Grade[] }).data
        : [];

    const pagination = (response as { pagination?: { total?: number; page?: number; pageSize?: number; totalPages?: number } }).pagination ?? {};

    return {
      data: grades,
      totalCount: pagination.total ?? 0,
      page: pagination.page ?? 1,
      pageSize: pagination.pageSize ?? 10,
      totalPages: pagination.totalPages ?? 0,
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
      fd1Adjustment?: number | null;
      fd2Adjustment?: number | null;
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
    if (data.fd1Adjustment !== undefined) {
      payload.fd1_adjustment = data.fd1Adjustment;
    }
    if (data.fd2Adjustment !== undefined) {
      payload.fd2_adjustment = data.fd2Adjustment;
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
   * Approve a specific defense stage (FD1 / FD2).
   * Only succeeds when all required evaluations are completed for the stage.
   */
  approveDefenseStage: async (
    projectId: string,
    stage: "fd1" | "fd2",
  ): Promise<{ status: string; canPublish: boolean }> => {
    const response = await apiClient.post<{ status: string; canPublish: boolean }>(
      `/projects-committee/defense-approvals/${projectId}/approve/${stage}`,
    );
    return response.data?.data ?? response.data ?? { status: 'approved', canPublish: true };
  },

  /**
   * Publish results for a specific defense stage.
   * Only allowed after the stage has been approved.
   */
  publishDefenseResults: async (
    projectId: string,
    stage: "fd1" | "fd2",
  ): Promise<{ status: string; publishedAt?: string }> => {
    const response = await apiClient.post<{ status: string; publishedAt?: string }>(
      `/projects-committee/defense-approvals/${projectId}/publish/${stage}`,
    );
    return response.data?.data ?? response.data ?? { status: 'published' };
  },

  /**
   * Get all evaluations for a project stage (for review).
   * Returns { evaluations, approval, statistics, validationErrors, canApprove }.
   */
  getDefenseReview: async (
    projectId: string,
    stage: "fd1" | "fd2",
  ): Promise<{
    evaluations: any[];
    approval: any;
    statistics: any;
    validationErrors: string[];
    canApprove: boolean;
  }> => {
    const response = await apiClient.get<{
      evaluations: any[];
      approval: any;
      statistics: any;
      validationErrors: string[];
      canApprove: boolean;
    }>(`/projects-committee/defense-evaluations/${projectId}/review/${stage}`);
    const data = response.data as any;
    return {
      evaluations: data?.evaluations ?? [],
      approval: data?.approval ?? null,
      statistics: data?.statistics ?? null,
      validationErrors: data?.validationErrors ?? [],
      canApprove: data?.canApprove ?? false,
    };
  },
};
