import { apiClient } from '../../../lib/axios'
import type { Project } from '../../../types/project.types'

export const committeeProjectService = {
  getAll: async (): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>('/projects-committee/projects')
    return Array.isArray(response.data) ? response.data : []
  },

  getApproved: async (): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>('/projects-committee/projects?status=approved')
    return Array.isArray(response.data) ? response.data : []
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
    const response = await apiClient.post<Project[]>('/projects-committee/projects/announce', {
      project_ids: projectIds,
    })
    return Array.isArray(response.data) ? response.data : []
  },
}
