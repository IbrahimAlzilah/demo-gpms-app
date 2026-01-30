import { apiClient } from "../../../../lib/axios";
import type { Grade } from "../../../../types/evaluation.types";

export interface SupervisorEvaluationProjectItem {
  project: {
    id: string;
    title: string;
    description?: string;
    supervisor?: { id: string; name: string };
    students?: Array<{ id: string; name: string; email?: string }>;
  };
  studentsCount: number;
  evaluatedCount: number;
  isLocked: boolean;
  evaluationProgress: number;
}

export const evaluationService = {
  /**
   * Submit grade for a single student
   */
  submitGrade: async (
    projectId: string,
    studentId: string,
    grade: {
      score: number;
      maxScore: number;
      criteria: Record<string, number>;
      comments?: string;
    },
    _evaluatedBy: string,
  ): Promise<Grade> => {
    const response = await apiClient.post<Grade>("/supervisor/evaluations", {
      project_id: projectId,
      student_id: studentId,
      score: grade.score,
      max_score: grade.maxScore,
      criteria: Array.isArray(grade.criteria) ? grade.criteria : [],
      comments: grade.comments,
    });
    return response.data;
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
  }): Promise<Grade[]> => {
    const response = await apiClient.post<Grade[]>("/supervisor/evaluations/batch", {
      project_id: data.projectId,
      score: data.score,
      max_score: data.maxScore,
      criteria: [],
      comments: data.comments,
      student_ids: data.studentIds,
    });
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Get grades for a specific project
   */
  getGrades: async (projectId: string): Promise<Grade[]> => {
    const response = await apiClient.get<Grade[]>(
      `/supervisor/evaluations?project_id=${projectId}`,
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Get projects assigned to supervisor with evaluation status
   */
  getProjects: async (): Promise<SupervisorEvaluationProjectItem[]> => {
    const response = await apiClient.get<SupervisorEvaluationProjectItem[]>(
      `/supervisor/evaluations`,
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Check if grades are locked for a project
   */
  isLocked: async (projectId: string): Promise<boolean> => {
    const response = await apiClient.get<{ isLocked: boolean }>(
      `/supervisor/evaluations/locked/${projectId}`,
    );
    return response.data?.isLocked ?? false;
  },
};
