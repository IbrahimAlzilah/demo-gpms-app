import { apiClient } from '../../../../lib/axios'
import type {
  Project,
  ProjectRegistration,
} from '../../../../types/project.types'
import type { TableQueryParams, TableResponse } from '../../../../types/table.types'

export const projectService = {
  getAll: async (): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>('/student/projects')
    return Array.isArray(response.data) ? response.data : []
  },

  getTableData: async (params?: TableQueryParams, available?: boolean): Promise<TableResponse<Project>> => {
    const queryParams = new URLSearchParams()
    
    if (available !== undefined) {
      queryParams.append('available', available.toString())
    }
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
      `/student/projects?${queryParams.toString()}`
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
      const response = await apiClient.get<Project>(`/student/projects/${id}`)
      return response.data
    } catch {
      return null
    }
  },

  getAvailable: async (): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>('/student/projects?available=true')
    return Array.isArray(response.data) ? response.data : []
  },

  getStudentRegistrations: async (studentId: string): Promise<ProjectRegistration[]> => {
    const response = await apiClient.get<ProjectRegistration[]>('/student/projects/registrations')
    // The axios interceptor already extracts response.data.data, so response.data is the array
    return Array.isArray(response.data) ? response.data : []
  },

  getRegistrationByProject: async (
    projectId: string,
    studentId: string
  ): Promise<ProjectRegistration | null> => {
    try {
      const registrations = await this.getStudentRegistrations(studentId)
      return registrations.find(r => r.projectId === projectId) || null
    } catch {
      return null
    }
  },

  register: async (projectId: string, studentId: string): Promise<ProjectRegistration> => {
    const response = await apiClient.post<ProjectRegistration>(
      `/student/projects/${projectId}/register`
    )
    // The axios interceptor already extracts response.data.data, so response.data is the registration
    return response.data
  },

  cancelRegistration: async (registrationId: string, studentId: string): Promise<void> => {
    await apiClient.delete(`/student/projects/registrations/${registrationId}`)
  },

  // Additional methods for ProjectDashboard
  getSupervisorNotes: async (projectId: string): Promise<any[]> => {
    try {
      const response = await apiClient.get<any[]>(`/student/projects/${projectId}/notes`)
      return Array.isArray(response.data) ? response.data : []
    } catch {
      return []
    }
  },

  getMilestones: async (projectId: string): Promise<any[]> => {
    try {
      const response = await apiClient.get<any[]>(`/student/projects/${projectId}/milestones`)
      return Array.isArray(response.data) ? response.data : []
    } catch {
      return []
    }
  },

  getMeetings: async (projectId: string): Promise<any[]> => {
    try {
      const response = await apiClient.get<any[]>(`/student/projects/${projectId}/meetings`)
      return Array.isArray(response.data) ? response.data : []
    } catch {
      return []
    }
  },

  getProgressPercentage: async (projectId: string): Promise<number> => {
    try {
      const response = await apiClient.get<{ progress: number }>(`/student/projects/${projectId}/progress`)
      return response.data?.progress || 0
    } catch {
      return 0
    }
  },

  replyToNote: async (projectId: string, noteId: string, content: string): Promise<any> => {
    const response = await apiClient.post<any>(
      `/student/projects/${projectId}/notes/${noteId}/reply`,
      { content }
    )
    return response.data
  },

  addSupervisorNote: async (projectId: string, content: string): Promise<any> => {
    const response = await apiClient.post<any>(`/student/projects/${projectId}/notes`, {
      content,
    })
    return response.data
  },
}
