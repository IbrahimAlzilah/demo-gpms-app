import { apiClient } from '../../../lib/axios'
import type {
  ProjectGroup,
  GroupInvitation,
} from '../../../types/project.types'
import type { User } from '../../../types/user.types'

export const groupService = {
  getByProjectId: async (projectId: string): Promise<ProjectGroup | null> => {
    try {
      const response = await apiClient.get<ProjectGroup>(`/student/groups?project_id=${projectId}`)
      return response.data
    } catch {
      return null
    }
  },

  getByStudentId: async (studentId: string): Promise<ProjectGroup | null> => {
    try {
      const response = await apiClient.get<ProjectGroup>('/student/groups')
      return response.data
    } catch {
      return null
    }
  },

  create: async (
    projectId: string,
    leaderId: string,
    members: User[]
  ): Promise<ProjectGroup> => {
    const response = await apiClient.post<ProjectGroup>('/student/groups', {
      project_id: projectId,
      member_ids: members.map(m => m.id),
    })
    return response.data
  },

  addMember: async (groupId: string, member: User): Promise<ProjectGroup> => {
    const response = await apiClient.post<ProjectGroup>(
      `/student/groups/${groupId}/members`,
      { member_id: member.id }
    )
    return response.data
  },

  removeMember: async (
    groupId: string,
    memberId: string
  ): Promise<ProjectGroup> => {
    const response = await apiClient.delete<ProjectGroup>(
      `/student/groups/${groupId}/members/${memberId}`
    )
    return response.data
  },

  updateLeader: async (
    groupId: string,
    newLeaderId: string
  ): Promise<ProjectGroup> => {
    const response = await apiClient.put<ProjectGroup>(
      `/student/groups/${groupId}/leader`,
      { leader_id: newLeaderId }
    )
    return response.data
  },

  // Group invitation methods
  inviteMember: async (
    groupId: string,
    inviterId: string,
    inviteeId: string,
    message?: string
  ): Promise<GroupInvitation> => {
    const response = await apiClient.post<GroupInvitation>('/student/groups/invite', {
      group_id: groupId,
      invitee_id: inviteeId,
      message,
    })
    return response.data
  },

  getInvitations: async (studentId: string): Promise<GroupInvitation[]> => {
    const response = await apiClient.get<GroupInvitation[]>('/student/groups/invitations')
    return Array.isArray(response.data) ? response.data : []
  },

  acceptInvitation: async (
    invitationId: string,
    studentId: string
  ): Promise<ProjectGroup> => {
    const response = await apiClient.post<ProjectGroup>(
      `/student/groups/invitations/${invitationId}/accept`
    )
    return response.data
  },

  rejectInvitation: async (
    invitationId: string,
    studentId: string
  ): Promise<void> => {
    await apiClient.post(`/student/groups/invitations/${invitationId}/reject`)
  },

  joinGroup: async (
    groupId: string,
    studentId: string
  ): Promise<ProjectGroup> => {
    const response = await apiClient.post<ProjectGroup>(
      `/student/groups/${groupId}/join`
    )
    return response.data
  },
}
