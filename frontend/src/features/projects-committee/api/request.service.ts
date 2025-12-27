import { apiClient } from '../../../lib/axios'
import type { Request } from '../../../types/request.types'
import type { TableQueryParams, TableResponse } from '../../../types/table.types'

export const committeeRequestService = {
  getPendingRequests: async (): Promise<Request[]> => {
    const response = await apiClient.get<Request[]>('/projects-committee/requests')
    return Array.isArray(response.data) ? response.data : []
  },

  getTableData: async (params?: TableQueryParams): Promise<TableResponse<Request>> => {
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
      `/projects-committee/requests?${queryParams.toString()}`
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
      const response = await apiClient.get<Request>(`/projects-committee/requests/${id}`)
      return response.data
    } catch {
      return null
    }
  },

  approve: async (
    id: string,
    approvedBy: string,
    comments?: string
  ): Promise<Request> => {
    const response = await apiClient.post<Request>(
      `/projects-committee/requests/${id}/approve`,
      { comments }
    )
    return response.data
  },

  reject: async (
    id: string,
    rejectedBy: string,
    comments?: string
  ): Promise<Request> => {
    const response = await apiClient.post<Request>(
      `/projects-committee/requests/${id}/reject`,
      { comments }
    )
    return response.data
  },
}
