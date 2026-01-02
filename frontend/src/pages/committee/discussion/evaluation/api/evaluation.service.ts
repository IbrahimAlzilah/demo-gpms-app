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
    committeeMembers: string[]
  }): Promise<void> => {
    await apiClient.post('/discussion-committee/evaluations', data)
  },

  getEvaluationsByProject: async (projectId: string): Promise<Grade[]> => {
    const response = await apiClient.get<Grade[]>(
      `/discussion-committee/evaluations?project_id=${projectId}`
    )
    return Array.isArray(response.data) ? response.data : []
  },
}
