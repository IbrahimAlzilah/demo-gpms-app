import { apiClient } from '../../../../lib/axios'
import type { Request } from '../../../../types/request.types'
import type { TableQueryParams, TableResponse } from '../../../../types/table.types'

export const requestService = {
  getAll: async (studentId?: string): Promise<Request[]> => {
    const response = await apiClient.get<Request[]>('/student/requests')
    return Array.isArray(response.data) ? response.data : []
  },

  getTableData: async (params?: TableQueryParams, studentId?: string): Promise<TableResponse<Request>> => {
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

    const response = await apiClient.get<{ data: Request[], pagination: any }>(
      `/student/requests?${queryParams.toString()}`
    )
    
    return {
      data: response.data || [],
      totalCount: response.pagination?.total || 0,
      page: response.pagination?.page || 1,
      pageSize: response.pagination?.pageSize || 10,
      totalPages: response.pagination?.totalPages || 0,
    }
  },

  getById: async (id: string): Promise<Request | null> => {
    try {
      const response = await apiClient.get<Request>(`/student/requests/${id}`)
      return response.data
    } catch {
      return null
    }
  },

  create: async (
    data: Omit<Request, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<Request> => {
    const response = await apiClient.post<Request>('/student/requests', {
      type: data.type,
      project_id: data.projectId,
      reason: data.reason,
      additional_data: data.additionalData,
    })
    return response.data
  },

  cancel: async (id: string): Promise<Request> => {
    const response = await apiClient.post<Request>(`/student/requests/${id}/cancel`)
    return response.data
  },
}
