import { apiClient } from '../../../../../lib/axios'
import type { Project } from '../../../../../types/project.types'
import type { User } from '../../../../../types/user.types'

export const supervisorAssignmentService = {
  getProjectsWithoutSupervisor: async (): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>('/projects-committee/projects?supervisor_id=null')
    return Array.isArray(response.data) ? response.data : []
  },

  getProjectsWithoutSupervisorCount: async (): Promise<number> => {
    try {
      const response = await apiClient.get<{ data: Project[], pagination?: { total?: number } }>(
        '/projects-committee/projects?supervisor_id=null&pageSize=1'
      )
      // Try to get count from pagination first
      if (response.pagination?.total !== undefined) {
        return response.pagination.total
      }
      // Fallback to data length if pagination not available
      return Array.isArray(response.data) ? response.data.length : 0
    } catch {
      return 0
    }
  },

  getAvailableSupervisors: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/projects-committee/supervisors')
    return Array.isArray(response.data) ? response.data : []
  },

  assignSupervisor: async (projectId: string, supervisorId: string): Promise<Project> => {
    const response = await apiClient.post<Project>(
      `/projects-committee/supervisors/assign`,
      {
        project_id: projectId,
        supervisor_id: supervisorId,
      }
    )
    return response.data
  },
}
