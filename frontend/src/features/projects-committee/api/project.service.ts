import { apiClient } from '../../../lib/axios'
import type { Project } from '../../../types/project.types'
import type { TableQueryParams, TableResponse } from '../../../types/table.types'

export const committeeProjectService = {
  getAll: async (): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>('/projects-committee/projects')
    return Array.isArray(response.data) ? response.data : []
  },

  getDraft: async (): Promise<Project[]> => {
    // Get all draft projects (not yet announced) by using a large page size
    // Only projects with status 'draft' should be shown (not 'available_for_registration')
    const response = await apiClient.get<{ data: Project[], pagination: any }>('/projects-committee/projects?status=draft&pageSize=1000')
    return Array.isArray(response.data) ? response.data : []
  },

  getTableData: async (params?: TableQueryParams, status?: string): Promise<TableResponse<Project>> => {
    const queryParams = new URLSearchParams()
    
    if (status) queryParams.append('status', status)
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

    const response = await apiClient.get<{ data: Project[], pagination: any }>(
      `/projects-committee/projects?${queryParams.toString()}`
    )
    
    return {
      data: response.data || [],
      totalCount: response.pagination?.total || 0,
      page: response.pagination?.page || 1,
      pageSize: response.pagination?.pageSize || 10,
      totalPages: response.pagination?.totalPages || 0,
    }
  },

  getById: async (id: string): Promise<Project | null> => {
    try {
      const response = await apiClient.get<Project>(`/projects-committee/projects/${id}`)
      return response.data
    } catch {
      return null
    }
  },

  announce: async (projectIds: string[]): Promise<Project[]> => {
    const response = await apiClient.post<{ data: Project[] }>('/projects-committee/projects/announce', {
      project_ids: projectIds,
    })
    return Array.isArray(response.data?.data) ? response.data.data : (Array.isArray(response.data) ? response.data : [])
  },
}
