import { apiClient } from '../../../../lib/axios'
import type { Project } from '../../../../types/project.types'
import type { TableQueryParams, TableResponse } from '../../../../types/table.types'

export const projectService = {
  getAssignedProjects: async (supervisorId: string): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>('/supervisor/projects')
    return Array.isArray(response.data) ? response.data : []
  },

  getTableData: async (params?: TableQueryParams, supervisorId?: string): Promise<TableResponse<Project>> => {
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

    const response = await apiClient.get<{ data: Project[], pagination: any }>(
      `/supervisor/projects?${queryParams.toString()}`
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
      const response = await apiClient.get<Project>(`/supervisor/projects/${id}`)
      return response.data
    } catch {
      return null
    }
  },

  getSupervisorNotes: async (projectId: string): Promise<any[]> => {
    try {
      const response = await apiClient.get<any[]>(`/supervisor/projects/${projectId}/notes`)
      return Array.isArray(response.data) ? response.data : []
    } catch {
      return []
    }
  },

  addSupervisorNote: async (projectId: string, content: string): Promise<any> => {
    const response = await apiClient.post<any>(`/supervisor/projects/${projectId}/notes`, {
      content,
    })
    return response.data
  },
}
