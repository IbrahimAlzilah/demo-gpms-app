import { apiClient } from '../../../lib/axios'
import type { Grade } from '../../../types/evaluation.types'

export const supervisorEvaluationService = {
  submitGrade: async (
    projectId: string,
    studentId: string,
    grade: {
      score: number
      maxScore: number
      criteria: Record<string, number>
      comments?: string
    },
    evaluatedBy: string
  ): Promise<Grade> => {
    const response = await apiClient.post<Grade>('/supervisor/evaluations', {
      project_id: projectId,
      student_id: studentId,
      score: grade.score,
      max_score: grade.maxScore,
      criteria: grade.criteria,
      comments: grade.comments,
    })
    return response.data
  },

  getGrades: async (projectId: string): Promise<Grade[]> => {
    const response = await apiClient.get<Grade[]>(`/supervisor/evaluations?project_id=${projectId}`)
    return Array.isArray(response.data) ? response.data : []
  },
}
