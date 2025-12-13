import { mockProjectService, mockProjects } from '../../../lib/mock/project.mock'
import { mockUsers } from '../../../lib/mock/auth.mock'
import type { Project } from '../../../types/project.types'
import type { User } from '../../../types/user.types'

export const supervisorAssignmentService = {
  getProjectsWithoutSupervisor: async (): Promise<Project[]> => {
    const all = await mockProjectService.getAll()
    return all.filter((p) => !p.supervisorId)
  },

  getAvailableSupervisors: async (): Promise<User[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockUsers.filter((u) => u.role === 'supervisor' && u.status === 'active')
  },

  assignSupervisor: async (projectId: string, supervisorId: string): Promise<Project> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const project = mockProjects.find((p) => p.id === projectId)
    if (!project) throw new Error('Project not found')
    
    const supervisor = mockUsers.find((u) => u.id === supervisorId)
    if (!supervisor || supervisor.role !== 'supervisor') {
      throw new Error('Invalid supervisor')
    }

    project.supervisorId = supervisorId
    project.supervisor = supervisor
    project.updatedAt = new Date().toISOString()
    
    return { ...project }
  },
}

