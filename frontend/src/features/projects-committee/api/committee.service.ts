import { mockProjectService, mockProjects } from '../../../lib/mock/project.mock'
import { mockUsers } from '../../../lib/mock/auth.mock'
import type { Project } from '../../../types/project.types'
import type { User } from '../../../types/user.types'

export interface CommitteeAssignment {
  projectId: string
  committeeMemberIds: string[]
}

export const committeeDistributionService = {
  getProjectsReadyForDiscussion: async (): Promise<Project[]> => {
    const all = await mockProjectService.getAll()
    return all.filter((p) => p.status === 'in_progress' && !p.committeeId)
  },

  getDiscussionCommitteeMembers: async (): Promise<User[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockUsers.filter(
      (u) => u.role === 'discussion_committee' && u.status === 'active'
    )
  },

  distributeProjects: async (assignments: CommitteeAssignment[]): Promise<Project[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const distributed: Project[] = []

    assignments.forEach((assignment) => {
      const project = mockProjects.find((p) => p.id === assignment.projectId)
      if (project) {
        project.committeeId = assignment.committeeMemberIds.join(',')
        project.updatedAt = new Date().toISOString()
        distributed.push({ ...project })
      }
    })

    return distributed
  },
}

