import { mockProjectService, mockProjects } from '../../../lib/mock/project.mock'
import type { Project } from '../../../types/project.types'

export const discussionCommitteeProjectService = {
  getAssignedProjects: async (committeeMemberId: string): Promise<Project[]> => {
    const all = await mockProjectService.getAll()
    // In real app, filter by committee assignment
    // For now, return projects that are in_progress
    return all.filter((p) => p.status === 'in_progress')
  },

  getById: async (id: string): Promise<Project | null> => {
    return mockProjectService.getById(id)
  },
}

