import { apiClient } from '../../../../lib/axios'
import type { Grade } from '../../../../types/evaluation.types'

export const gradeService = {
  getGrades: async (studentId: string, isApproved?: boolean): Promise<Grade[]> => {
    const params = new URLSearchParams()
    if (isApproved !== undefined) {
      params.append('is_approved', String(isApproved))
    }
    const queryString = params.toString()
    const url = `/student/grades${queryString ? `?${queryString}` : ''}`
    const response = await apiClient.get<{ success: boolean; data: Grade[] }>(url)
    return Array.isArray(response.data?.data) ? response.data.data : []
  },

  getGradeById: async (id: string): Promise<Grade | null> => {
    try {
      const response = await apiClient.get<{ success: boolean; data: Grade }>(`/student/grades/${id}`)
      return response.data?.data || null
    } catch {
      return null
    }
  },
}
