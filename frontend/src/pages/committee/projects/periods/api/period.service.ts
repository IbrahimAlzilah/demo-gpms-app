import { apiClient } from '../../../../../lib/axios'
import type { TimePeriod } from '../../../../../types/period.types'
import type { TableQueryParams, TableResponse } from '../../../../../types/table.types'

export const periodService = {
  getAll: async (): Promise<TimePeriod[]> => {
    const response = await apiClient.get<TimePeriod[]>('/projects-committee/periods')
    return Array.isArray(response.data) ? response.data : []
  },

  getTableData: async (params?: TableQueryParams): Promise<TableResponse<TimePeriod>> => {
    const queryParams = new URLSearchParams()
    
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
    if (params?.search) queryParams.append('search', params.search)
    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(`filters[${key}]`, String(value))
        }
      })
    }

    const response = await apiClient.get<{ data: TimePeriod[], pagination: any }>(
      `/projects-committee/periods?${queryParams.toString()}`
    )
    
    return {
      data: response.data || [],
      totalCount: response.pagination?.total || 0,
      page: response.pagination?.page || 1,
      pageSize: response.pagination?.pageSize || 10,
      totalPages: response.pagination?.totalPages || 0,
    }
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

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects-committee/periods/${id}`)
  },
}
