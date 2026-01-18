import { useMutation, useQueryClient } from '@tanstack/react-query'
import { groupService } from '../api/group.service'
import { useAuthStore } from '@/pages/auth/login'
import type { User } from '@/types/user.types'

export function useCreateGroup() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: ({
      projectId,
      members,
    }: {
      projectId: string
      members: User[]
    }) => {
      if (!user) throw new Error('User not authenticated')
      return groupService.create(projectId, user.id, members)
    },
    onSuccess: (data) => {
      // Invalidate all group queries
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      // Invalidate specific student group query
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['groups', 'student', user.id] })
      }
      // Invalidate project-specific group query
      if (data?.projectId) {
        queryClient.invalidateQueries({ queryKey: ['groups', 'project', data.projectId] })
      }
    },
  })
}

export function useAddGroupMember() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: ({ groupId, member }: { groupId: string; member: User }) =>
      groupService.addMember(groupId, member),
    onSuccess: (data) => {
      // Invalidate all group queries
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      // Invalidate specific student group query
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['groups', 'student', user.id] })
      }
      // Invalidate project-specific group query
      if (data?.projectId) {
        queryClient.invalidateQueries({ queryKey: ['groups', 'project', data.projectId] })
      }
    },
  })
}

export function useRemoveGroupMember() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: ({ groupId, memberId }: { groupId: string; memberId: string }) =>
      groupService.removeMember(groupId, memberId),
    onSuccess: (data) => {
      // Invalidate all group queries
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      // Invalidate specific student group query
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['groups', 'student', user.id] })
      }
      // Invalidate project-specific group query
      if (data?.projectId) {
        queryClient.invalidateQueries({ queryKey: ['groups', 'project', data.projectId] })
      }
    },
  })
}

export function useInviteGroupMember() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: ({
      groupId,
      inviteeId,
      message,
    }: {
      groupId: string
      inviteeId: string
      message?: string
    }) => {
      if (!user) throw new Error('User not authenticated')
      return groupService.inviteMember(groupId, user.id, inviteeId, message)
    },
    onSuccess: () => {
      // Invalidate all group invitation queries
      queryClient.invalidateQueries({ queryKey: ['group-invitations'] })
      // Invalidate specific user invitations
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['group-invitations', user.id] })
      }
    },
  })
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: (invitationId: string) => {
      if (!user) throw new Error('User not authenticated')
      return groupService.acceptInvitation(invitationId, user.id)
    },
    onSuccess: (data) => {
      // Invalidate all group queries
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      // Invalidate specific student group query
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['groups', 'student', user.id] })
      }
      // Invalidate project-specific group query
      if (data?.projectId) {
        queryClient.invalidateQueries({ queryKey: ['groups', 'project', data.projectId] })
      }
      // Invalidate all group invitation queries
      queryClient.invalidateQueries({ queryKey: ['group-invitations'] })
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['group-invitations', user.id] })
      }
    },
  })
}

export function useRejectInvitation() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: (invitationId: string) => {
      if (!user) throw new Error('User not authenticated')
      return groupService.rejectInvitation(invitationId, user.id)
    },
    onSuccess: () => {
      // Invalidate all group invitation queries
      queryClient.invalidateQueries({ queryKey: ['group-invitations'] })
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['group-invitations', user.id] })
      }
    },
  })
}

export function useJoinGroup() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: (groupId: string) => {
      if (!user) throw new Error('User not authenticated')
      return groupService.join(groupId, user.id)
    },
    onSuccess: (data) => {
      // Invalidate all group queries
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      // Invalidate specific student group query
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['groups', 'student', user.id] })
      }
      // Invalidate project-specific group query
      if (data?.projectId) {
        queryClient.invalidateQueries({ queryKey: ['groups', 'project', data.projectId] })
      }
      // Invalidate all group invitation queries
      queryClient.invalidateQueries({ queryKey: ['group-invitations'] })
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['group-invitations', user.id] })
      }
    },
  })
}

export function useCreateJoinRequest() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: ({ groupId, message }: { groupId: string; message?: string }) => {
      return groupService.createJoinRequest(groupId, message)
    },
    onSuccess: (data) => {
      // Invalidate join requests for the group
      if (data?.groupId) {
        queryClient.invalidateQueries({ queryKey: ['group-join-requests', data.groupId] })
      }
      // Invalidate all group queries
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['groups', 'student', user.id] })
      }
    },
  })
}

export function useApproveJoinRequest() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: (requestId: string) => {
      return groupService.approveJoinRequest(requestId)
    },
    onSuccess: (data) => {
      // Invalidate join requests for the group
      if (data?.projectId) {
        queryClient.invalidateQueries({ queryKey: ['group-join-requests'] })
      }
      // Invalidate all group queries
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['groups', 'student', user.id] })
      }
      if (data?.projectId) {
        queryClient.invalidateQueries({ queryKey: ['groups', 'project', data.projectId] })
      }
    },
  })
}

export function useRejectJoinRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ requestId, comments }: { requestId: string; comments?: string }) => {
      return groupService.rejectJoinRequest(requestId, comments)
    },
    onSuccess: () => {
      // Invalidate join requests
      queryClient.invalidateQueries({ queryKey: ['group-join-requests'] })
    },
  })
}
