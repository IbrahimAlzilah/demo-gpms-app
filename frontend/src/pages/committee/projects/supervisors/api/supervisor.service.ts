import { apiClient } from '../../../../../lib/axios'
import type { Project } from '../../../../../types/project.types'
import type { User } from '../../../../../types/user.types'

export const supervisorAssignmentService = {
  getProjectsWithoutSupervisor: async (page = 1, pageSize = 10): Promise<{ data: Project[], meta: { total: number, page: number, totalPages: number } }> => {
    const response = await apiClient.get(
      `/projects-committee/projects?supervisor_id=null&page=${page}&pageSize=${pageSize}`
    ) as any

    const data = Array.isArray(response.data) ? response.data : []
    const meta = response.pagination || { total: data.length, page, totalPages: 1 }

    return { data, meta }
  },

  getProjectsWithoutSupervisorCount: async (): Promise<number> => {
    try {
      const response = await apiClient.get(
        '/projects-committee/projects?supervisor_id=null&pageSize=1'
      ) as any
      
      if (response.pagination?.total !== undefined) {
        return response.pagination.total
      }
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
