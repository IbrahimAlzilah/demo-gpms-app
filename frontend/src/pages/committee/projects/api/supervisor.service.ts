import { apiClient } from '../../../../lib/axios'
import type { Project } from '../../../../types/project.types'
import type { User } from '../../../../types/user.types'

export const supervisorAssignmentService = {
  getProjectsWithoutSupervisor: async (): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>('/projects-committee/projects?supervisor_id=null')
    return Array.isArray(response.data) ? response.data : []
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
