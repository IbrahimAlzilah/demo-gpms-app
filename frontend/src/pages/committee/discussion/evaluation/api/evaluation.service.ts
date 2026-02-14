import { apiClient } from "../../../../../lib/axios";
import type { Grade } from "@/types/evaluation.types";
import type {
  TableQueryParams,
  TableResponse,
} from "../../../../../types/table.types";
import type { EvaluationListItem, EvaluationProjectItem } from "../types/Evaluation.types";

export const committeeEvaluationService = {
  /**
   * Submit grade for a single student
   */
  submitFinalGrade: async (data: {
    projectId: string;
    studentId: string;
    grade: {
      score: number;
      maxScore: number;
      criteria: Record<string, unknown>;
      comments?: string;
    };
  }): Promise<void> => {
    // Send snake_case format matching backend expectations
    // Backend will derive committee members from DB assignments
    await apiClient.post("/discussion-committee/evaluations", {
      project_id: data.projectId,
      student_id: data.studentId,
      score: data.grade.score,
      max_score: data.grade.maxScore,
      criteria: Array.isArray(data.grade.criteria) ? data.grade.criteria : [],
      comments: data.grade.comments,
    });
  },

  /**
   * Submit same grade for all students in a project (group evaluation)
   */
  submitBatchGrade: async (data: {
    projectId: string;
    score: number;
    maxScore: number;
    comments?: string;
    studentIds?: string[];
  }): Promise<void> => {
    await apiClient.post("/discussion-committee/evaluations/batch", {
      project_id: data.projectId,
      score: data.score,
      max_score: data.maxScore,
      criteria: [],
      comments: data.comments,
      student_ids: data.studentIds,
    });
  },

  /**
   * Get evaluations/grades for a specific project
   */
  getEvaluationsByProject: async (projectId: string): Promise<Grade[]> => {
    const response = await apiClient.get<Grade[]>(
      `/discussion-committee/evaluations?project_id=${projectId}`,
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Get projects assigned to committee member for evaluation (grouped view)
   */
  getProjects: async (): Promise<EvaluationProjectItem[]> => {
    const response = await apiClient.get<EvaluationProjectItem[]>(
      `/discussion-committee/evaluations/projects`,
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Check if grades are locked for a project
   */
  isLocked: async (projectId: string): Promise<boolean> => {
    const response = await apiClient.get<{ isLocked: boolean }>(
      `/discussion-committee/evaluations/locked/${projectId}`,
    );
    return response.data?.isLocked ?? false;
  },

  /**
   * Get table data for evaluation list (flat student rows)
   */
  getTableData: async (
    params?: TableQueryParams,
  ): Promise<TableResponse<EvaluationListItem>> => {
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

    const response = await apiClient.get<EvaluationListItem[]>(
      `/discussion-committee/evaluations?${queryParams.toString()}`,
    );

    return {
      data: Array.isArray(response.data) ? response.data : [],
      totalCount: response.pagination?.total || 0,
      page: response.pagination?.page || 1,
      pageSize: response.pagination?.pageSize || 10,
      totalPages: response.pagination?.totalPages || 0,
    };
  },
  /**
   * Submit defense evaluation (FD1 / FD2)
   */
  submitDefenseEvaluation: async (data: {
    projectId: string;
    studentId: string;
    defenseStage: 'fd1' | 'fd2';
    grade: {
      score: number;
      maxScore: number;
      criteria: Record<string, unknown>;
      comments?: string;
    };
  }): Promise<void> => {
    await apiClient.post("/discussion-committee/defense-evaluations", {
      project_id: data.projectId,
      student_id: data.studentId,
      defense_stage: data.defenseStage,
      score: data.grade.score,
      max_score: data.grade.maxScore,
      criteria: data.grade.criteria,
      notes: data.grade.comments,
    });
  },

  /**
   * Get defense evaluations for a project and stage
   */
  getDefenseEvaluations: async (projectId: string, stage: 'fd1' | 'fd2'): Promise<Grade[]> => {
    const response = await apiClient.get<any>(
      `/discussion-committee/defense-evaluations/my-evaluations?project_id=${projectId}&stage=${stage}`
    );
    
    // Controller returns { data: { evaluations: [...], isLocked: boolean, ... } }
    // Axios returns response.data as the body.
    // So response.data.evaluations is likely correct if the interceptor unwraps 'data', 
    // or response.data.data.evaluations if not. 
    // Usually existing patterns suggest unwrapping happens or we access directly.
    // Let's assume standard response like getMyEvaluations returns.
    
    const evaluations = response.data?.evaluations ?? response.data?.data?.evaluations ?? [];
    
    return evaluations.map((item: any) => ({
      ...item,
      studentId: item.student.id,
      student: item.student,
      // Map 'myEvaluation' to 'committeeGrade' for frontend compatibility
      committeeGrade: item.myEvaluation ? {
        score: item.myEvaluation.score,
        maxScore: item.myEvaluation.maxScore,
        comments: item.myEvaluation.notes,
        criteria: item.myEvaluation.criteria,
        evaluatedAt: item.myEvaluation.createdAt
      } : undefined
    })) as Grade[];
  },

  /**
   * Get projects assigned for defense evaluation
   */
  getDefenseProjects: async (stage: 'fd1' | 'fd2'): Promise<EvaluationProjectItem[]> => {
    const response = await apiClient.get<{ data: EvaluationProjectItem[] }>(
      `/discussion-committee/defense-evaluations/projects/${stage}`
    );
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  },
};
