import { apiClient } from '../../../lib/axios'
import type { TimePeriod } from '../../../types/period.types'

export const periodService = {
  getAll: async (): Promise<TimePeriod[]> => {
    const response = await apiClient.get<TimePeriod[]>('/projects-committee/periods')
    return Array.isArray(response.data) ? response.data : []
  },

  create: async (
    data: Omit<TimePeriod, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<TimePeriod> => {
    const response = await apiClient.post<TimePeriod>('/projects-committee/periods', {
      name: data.name,
      type: data.type,
      start_date: data.startDate,
      end_date: data.endDate,
      academic_year: data.academicYear,
      semester: data.semester,
      description: data.description,
    })
    return response.data
  },

  update: async (id: string, data: Partial<TimePeriod>): Promise<TimePeriod> => {
    const response = await apiClient.put<TimePeriod>(`/projects-committee/periods/${id}`, {
      name: data.name,
      type: data.type,
      start_date: data.startDate,
      end_date: data.endDate,
      is_active: data.isActive,
      academic_year: data.academicYear,
      semester: data.semester,
      description: data.description,
    })
    return response.data
  },
}
