import { apiClient } from '../../../lib/axios'
import type { Project } from '../../../types/project.types'
import type { User } from '../../../types/user.types'

export interface CommitteeAssignment {
  projectId: string
  committeeMemberIds: string[]
}

export const committeeDistributionService = {
  getProjectsReadyForDiscussion: async (): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>('/projects-committee/projects?status=in_progress')
    return Array.isArray(response.data) ? response.data : []
  },

  getDiscussionCommitteeMembers: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/projects-committee/committees/members')
    return Array.isArray(response.data) ? response.data : []
  },

  distributeProjects: async (assignments: CommitteeAssignment[]): Promise<Project[]> => {
    const response = await apiClient.post<Project[]>('/projects-committee/committees/distribute', {
      assignments: assignments.map(a => ({
        project_id: a.projectId,
        committee_member_ids: a.committeeMemberIds,
      })),
    })
    return Array.isArray(response.data) ? response.data : []
  },
}
