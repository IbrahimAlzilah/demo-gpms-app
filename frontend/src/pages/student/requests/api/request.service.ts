import { apiClient } from '../../../../lib/axios'
import type { Request } from '../../../../types/request.types'
import type { TableQueryParams, TableResponse } from '../../../../types/table.types'

export const requestService = {
  getAll: async (_studentId?: string): Promise<Request[]> => {
    const response = await apiClient.get<Request[]>('/student/requests')
    return Array.isArray(response.data) ? response.data : []
  },

  getTableData: async (params?: TableQueryParams, _studentId?: string): Promise<TableResponse<Request>> => {
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

    const response = await apiClient.get<Request[]>(
      `/student/requests?${queryParams.toString()}`
    )
    
    // Axios interceptor extracts data and pagination from { success: true, data: [...], pagination: {...} }
    // So response.data is the array and response.pagination is the pagination object
    return {
      data: Array.isArray(response.data) ? response.data : [],
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
    const payload: Record<string, any> = {
      type: data.type,
      reason: data.reason,
    }
    
    // Only include project_id if it's provided (backend will auto-fetch from group for change_supervisor)
    if (data.projectId) {
      payload.project_id = data.projectId
    }
    
    if (data.additionalData) {
      payload.additional_data = data.additionalData
    }

    const response = await apiClient.post<Request>('/student/requests', payload)
    return response.data
  },

  update: async (
    id: string,
    data: Partial<Omit<Request, 'id' | 'createdAt' | 'updatedAt' | 'status'>>
  ): Promise<Request> => {
    const payload: Record<string, any> = {}
    
    if (data.type !== undefined) payload.type = data.type
    if (data.projectId !== undefined) payload.project_id = data.projectId
    if (data.reason !== undefined) payload.reason = data.reason
    if (data.additionalData !== undefined) payload.additional_data = data.additionalData

    const response = await apiClient.put<Request>(`/student/requests/${id}`, payload)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/student/requests/${id}`)
  },

  cancel: async (id: string): Promise<Request> => {
    const response = await apiClient.post<Request>(`/student/requests/${id}/cancel`)
    return response.data
  },
}
