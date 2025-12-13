import { mockProjectService } from '../../../lib/mock/project.mock'
import type { Project } from '../../../types/project.types'

export const supervisorProjectService = {
  getAssignedProjects: async (supervisorId: string): Promise<Project[]> => {
    const allProjects = await mockProjectService.getAll()
    return allProjects.filter((p) => p.supervisorId === supervisorId)
  },

  getById: async (id: string): Promise<Project | null> => {
    return mockProjectService.getById(id)
  },
}

