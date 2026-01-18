import { apiClient } from '../../../../lib/axios'
import type {
  ProjectGroup,
  GroupInvitation,
  GroupJoinRequest,
} from '../../../../types/project.types'
import type { User } from '../../../../types/user.types'

/**
 * Extract error message from API error response
 */
const getErrorMessage = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  if (error.message) {
    return error.message
  }
  return 'An unexpected error occurred'
}

export const groupService = {
  getByProjectId: async (projectId: string): Promise<ProjectGroup | null> => {
    try {
      const response = await apiClient.get<ProjectGroup>(`/student/groups?project_id=${projectId}`)
      // Backend returns null when no group exists - this is a valid response
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  getByStudentId: async (_studentId: string): Promise<ProjectGroup | null> => {
    try {
      const response = await apiClient.get<ProjectGroup>('/student/groups')
      // Backend returns null when no group exists - this is a valid response
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  create: async (
    projectId: string,
    _leaderId: string,
    members: User[]
  ): Promise<ProjectGroup> => {
    try {
      const response = await apiClient.post<ProjectGroup>('/student/groups', {
        project_id: projectId,
        member_ids: members.map(m => m.id),
      })
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  addMember: async (groupId: string, member: User): Promise<ProjectGroup> => {
    try {
      const response = await apiClient.post<ProjectGroup>(
        `/student/groups/${groupId}/members`,
        { member_id: member.id }
      )
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  removeMember: async (
    groupId: string,
    memberId: string
  ): Promise<ProjectGroup> => {
    try {
      const response = await apiClient.delete<ProjectGroup>(
        `/student/groups/${groupId}/members/${memberId}`
      )
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  updateLeader: async (
    groupId: string,
    newLeaderId: string
  ): Promise<ProjectGroup> => {
    try {
      const response = await apiClient.put<ProjectGroup>(
        `/student/groups/${groupId}/leader`,
        { leader_id: newLeaderId }
      )
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  // Group invitation methods
  inviteMember: async (
    groupId: string,
    _inviterId: string,
    inviteeId: string,
    message?: string
  ): Promise<GroupInvitation> => {
    try {
      const response = await apiClient.post<GroupInvitation>('/student/groups/invite', {
        group_id: groupId,
        invitee_id: inviteeId,
        message,
      })
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  getInvitations: async (_studentId: string): Promise<GroupInvitation[]> => {
    try {
      const response = await apiClient.get<GroupInvitation[]>('/student/groups/invitations')
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  acceptInvitation: async (
    invitationId: string,
    _studentId: string
  ): Promise<ProjectGroup> => {
    try {
      const response = await apiClient.post<ProjectGroup>(
        `/student/groups/invitations/${invitationId}/accept`
      )
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  rejectInvitation: async (
    invitationId: string,
    _studentId: string
  ): Promise<void> => {
    try {
      await apiClient.post(`/student/groups/invitations/${invitationId}/reject`)
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  join: async (groupId: string, userId: string): Promise<ProjectGroup> => {
    try {
      const response = await apiClient.post<ProjectGroup>(
        `/student/groups/${groupId}/members`,
        { member_id: userId }
      )
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  // Group join request methods
  createJoinRequest: async (
    groupId: string,
    message?: string
  ): Promise<GroupJoinRequest> => {
    try {
      const response = await apiClient.post<GroupJoinRequest>('/student/groups/join-request', {
        group_id: groupId,
        message,
      })
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  getJoinRequests: async (groupId: string): Promise<GroupJoinRequest[]> => {
    try {
      const response = await apiClient.get<GroupJoinRequest[]>(
        `/student/groups/${groupId}/join-requests`
      )
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  approveJoinRequest: async (requestId: string): Promise<ProjectGroup> => {
    try {
      const response = await apiClient.post<ProjectGroup>(
        `/student/groups/join-requests/${requestId}/approve`
      )
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  rejectJoinRequest: async (
    requestId: string,
    comments?: string
  ): Promise<void> => {
    try {
      await apiClient.post(`/student/groups/join-requests/${requestId}/reject`, {
        comments,
      })
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },
}
