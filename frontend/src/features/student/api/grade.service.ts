import { apiClient } from '../../../lib/axios'
import type { Grade } from '../../../types/evaluation.types'

export const gradeService = {
  getGrades: async (studentId: string): Promise<Grade[]> => {
    const response = await apiClient.get<Grade[]>('/student/grades')
    return Array.isArray(response.data) ? response.data : []
  },

  getGradeById: async (id: string): Promise<Grade | null> => {
    try {
      const response = await apiClient.get<Grade>(`/student/grades/${id}`)
      return response.data
    } catch {
      return null
    }
  },
}
