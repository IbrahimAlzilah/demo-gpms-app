import { apiClient } from '../../../lib/axios'
import type { ProjectRegistration } from '../../../types/project.types'
import type { TableQueryParams, TableResponse } from '../../../types/table.types'

export interface RegistrationListParams {
  status?: 'pending' | 'approved' | 'rejected'
  project_id?: string
  page?: number
  pageSize?: number
  search?: string
}

export interface ApproveRegistrationParams {
  comments?: string
}

export interface RejectRegistrationParams {
  comments: string
}

export const registrationService = {
  getAll: async (params?: RegistrationListParams): Promise<{
    data: ProjectRegistration[]
    pagination?: {
      current_page: number
      per_page: number
      total: number
      last_page: number
    }
  }> => {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)
    if (params?.project_id) queryParams.append('project_id', params.project_id)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params?.search) queryParams.append('search', params.search)

    const response = await apiClient.get<{
      data: ProjectRegistration[]
      pagination?: {
        current_page: number
        per_page: number
        total: number
        last_page: number
      }
    }>(`/projects-committee/registrations?${queryParams.toString()}`)
    return response.data
  },

  getTableData: async (params?: TableQueryParams): Promise<TableResponse<ProjectRegistration>> => {
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

    const response = await apiClient.get<{ data: ProjectRegistration[], pagination: any }>(
      `/projects-committee/registrations?${queryParams.toString()}`
    )
    
    return {
      data: response.data || [],
      totalCount: response.pagination?.total || 0,
      page: response.pagination?.current_page || 1,
      pageSize: response.pagination?.per_page || 10,
      totalPages: response.pagination?.last_page || 0,
    }
  },

  getById: async (id: string): Promise<ProjectRegistration> => {
    const response = await apiClient.get<ProjectRegistration>(
      `/projects-committee/registrations/${id}`
    )
    return response.data
  },

  approve: async (
    registrationId: string,
    params?: ApproveRegistrationParams
  ): Promise<ProjectRegistration> => {
    const response = await apiClient.post<ProjectRegistration>(
      `/projects-committee/registrations/${registrationId}/approve`,
      params
    )
    return response.data
  },

  reject: async (
    registrationId: string,
    params: RejectRegistrationParams
  ): Promise<ProjectRegistration> => {
    const response = await apiClient.post<ProjectRegistration>(
      `/projects-committee/registrations/${registrationId}/reject`,
      params
    )
    return response.data
  },
}
