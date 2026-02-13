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

/** Stage statistics from GET /supervisor/defense-evaluations */
export interface DefenseStageStats {
  totalStudents: number;
  supervisorEvaluated: number;
  committeeExpected: number;
  committeeSubmitted: number;
  committeeProgress: number;
  isComplete: boolean;
  status: string;
  isLocked: boolean;
}

/** Item from GET /supervisor/defense-evaluations (FD1/FD2 per project) */
export interface SupervisorDefenseEvaluationItem {
  project: {
    id: string;
    title: string;
    description?: string;
    specialization?: string;
    studentsCount: number;
  };
  fd1: DefenseStageStats;
  fd2: DefenseStageStats;
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
   * Get projects assigned to supervisor with evaluation status (legacy)
   */
  getProjects: async (): Promise<SupervisorEvaluationProjectItem[]> => {
    const response = await apiClient.get<SupervisorEvaluationProjectItem[]>(
      `/supervisor/evaluations`,
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Get supervisor's projects with FD1/FD2 defense evaluation status
   */
  getDefenseEvaluationProjects: async (): Promise<SupervisorDefenseEvaluationItem[]> => {
    const response = await apiClient.get<SupervisorDefenseEvaluationItem[]>(
      `/supervisor/defense-evaluations`,
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
    await apiClient.post("/supervisor/defense-evaluations", {
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
    const response = await apiClient.get<{ evaluations: Array<{ student: { id: string; name?: string; email?: string }; evaluation: { id: string; score: number; max_score: number; notes?: string; criteria?: unknown } | null }> }>(
      `/supervisor/defense-evaluations/${projectId}/stage/${stage}`
    );
    const evaluations = response.data?.evaluations ?? [];
    return evaluations.map((item: { student: { id: string }; evaluation: { score: number; max_score: number; notes?: string; criteria?: unknown } | null }) => ({
      studentId: item.student.id,
      student: item.student,
      supervisorGrade: item.evaluation
        ? {
            score: item.evaluation.score,
            maxScore: item.evaluation.max_score,
            comments: item.evaluation.notes,
            criteria: item.evaluation.criteria,
          }
        : undefined,
    })) as Grade[];
  },
  
  /**
   * Check if defense grades are locked for a project/stage
   */
  isDefenseLocked: async (projectId: string, stage: 'fd1' | 'fd2'): Promise<boolean> => {
    const response = await apiClient.get<{ isLocked: boolean }>(
      `/supervisor/defense-evaluations/${projectId}/locked/${stage}`,
    );
    return response.data?.isLocked ?? false;
  },
};
