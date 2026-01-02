import { apiClient } from '../../../../lib/axios'
import type { Request } from '../../../../types/request.types'
import type { TableQueryParams, TableResponse } from '../../../../types/table.types'

export const supervisionService = {
  getRequests: async (supervisorId: string): Promise<Request[]> => {
    const response = await apiClient.get<Request[]>('/supervisor/supervision-requests')
    return Array.isArray(response.data) ? response.data : []
  },

  getTableData: async (params?: TableQueryParams, supervisorId?: string): Promise<TableResponse<Request>> => {
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
      `/supervisor/supervision-requests?${queryParams.toString()}`
    )
    
    return {
      data: response.data || [],
      totalCount: response.pagination?.total || 0,
      page: response.pagination?.page || 1,
      pageSize: response.pagination?.pageSize || 10,
      totalPages: response.pagination?.totalPages || 0,
    }
  },

  approveRequest: async (
    requestId: string,
    supervisorId: string,
    comments?: string
  ): Promise<Request> => {
    const response = await apiClient.post<Request>(
      `/supervisor/supervision-requests/${requestId}/approve`,
      { comments }
    )
    return response.data
  },

  rejectRequest: async (
    requestId: string,
    supervisorId: string,
    comments?: string
  ): Promise<Request> => {
    const response = await apiClient.post<Request>(
      `/supervisor/supervision-requests/${requestId}/reject`,
      { comments }
    )
    return response.data
  },
}
