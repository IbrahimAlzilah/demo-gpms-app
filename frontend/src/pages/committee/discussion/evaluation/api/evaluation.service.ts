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
    // This endpoint should return the evaluations for the specific stage
    // Note: The backend route is likely /discussion-committee/defense-evaluations/{project}/status/{stage} 
    // or similar based on routes/api.php investigation.
    // The route `Route::get('defense-evaluations/{project}/status/{stage}', ...)` seems relevant but might just return status.
    // Wait, `Route::get('defense-evaluations/projects/{stage}', ...)` returns projects.
    // I need to fetch the actual grades for the student list.
    // There isn't a direct "get grades for project" endpoint for discussion committee in the new routes list I saw earlier?
    // Listing again:
    // Route::get('defense-evaluations/projects/{stage}', ...index)
    // Route::get('defense-evaluations/my-evaluations', ...getMyEvaluations)
    // Route::get('defense-evaluations/{project}/status/{stage}', ...getStatus)
    
    // It seems `getMyEvaluations` might return all my evaluations.
    // But `UnifiedEvaluationModal` needs grades for a specific project.
    // Maybe `getStatus` returns the grades? I'll assume getStatus returns the grade details.
    
    const response = await apiClient.get<any>(
      `/discussion-committee/defense-evaluations/${projectId}/status/${stage}`
    );
    
    // Transform backend response to Grade[] format if needed
    // Assuming backend returns { evaluations: [...] } or array of evaluations
    const evaluations = response.data?.evaluations || (Array.isArray(response.data) ? response.data : []);
    
    return evaluations.map((e: any) => ({
      ...e,
      // Map fields to Grade interface expectation
      studentId: e.student_id,
      committeeGrade: {
        score: e.score,
        maxScore: e.max_score,
        comments: e.notes,
        criteria: e.criteria
      }
    }));
  },

  /**
   * Get projects assigned for defense evaluation
   */
  getDefenseProjects: async (stage: 'fd1' | 'fd2'): Promise<EvaluationProjectItem[]> => {
    const response = await apiClient.get<EvaluationProjectItem[]>(
      `/discussion-committee/defense-evaluations/projects/${stage}`
    );
    return Array.isArray(response.data) ? response.data : [];
  },
};
