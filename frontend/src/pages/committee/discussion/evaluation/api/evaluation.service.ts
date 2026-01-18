import { apiClient } from '../../../../../lib/axios'
import type { Grade } from '@/types/evaluation.types'

export const committeeEvaluationService = {
  submitFinalGrade: async (data: {
    projectId: string
    studentId: string
    grade: {
      score: number
      maxScore: number
      criteria: Record<string, unknown>
      comments?: string
    }
  }): Promise<void> => {
    // Send snake_case format matching backend expectations
    // Backend will derive committee members from DB assignments
    await apiClient.post('/discussion-committee/evaluations', {
      project_id: data.projectId,
      student_id: data.studentId,
      score: data.grade.score,
      max_score: data.grade.maxScore,
      criteria: data.grade.criteria,
      comments: data.grade.comments,
    })
  },

  getEvaluationsByProject: async (projectId: string): Promise<Grade[]> => {
    const response = await apiClient.get<Grade[]>(
      `/discussion-committee/evaluations?project_id=${projectId}`
    )
    return Array.isArray(response.data) ? response.data : []
  },
}
