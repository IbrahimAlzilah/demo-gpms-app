import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { groupService } from '../api/group.service'
import { useAuthStore } from '@/pages/auth/login'
import type { User } from '@/types/user.types'

/**
 * Invalidate all group-related queries
 * This ensures the UI reflects the latest backend state after any mutation
 */
function invalidateGroupQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  userId?: string,
  projectId?: string
) {
  // Invalidate all group queries (with predicate to catch all variations)
  queryClient.invalidateQueries({ 
    predicate: (query) => {
      const key = query.queryKey
      return (
        Array.isArray(key) &&
        (key[0] === 'groups' || 
         key[0] === 'group-invitations' ||
         key[0] === 'group-join-requests' ||
         key[0] === 'my-join-requests')
      )
    }
  })

  // Also explicitly invalidate common query patterns
  queryClient.invalidateQueries({ queryKey: ['groups'] })
  queryClient.invalidateQueries({ queryKey: ['group-invitations'] })
  queryClient.invalidateQueries({ queryKey: ['group-join-requests'] })
  queryClient.invalidateQueries({ queryKey: ['my-join-requests'] })

  // Invalidate user-specific queries
  if (userId) {
    queryClient.invalidateQueries({ queryKey: ['groups', 'student', userId] })
    queryClient.invalidateQueries({ queryKey: ['group-invitations', userId] })
  }

  // Invalidate project-specific queries
  if (projectId) {
    queryClient.invalidateQueries({ queryKey: ['groups', 'project', projectId] })
  }
}

export function useCreateGroup() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: ({
      name,
      members,
    }: {
      name?: string | null
      members: User[]
    }) => {
      if (!user) throw new Error('User not authenticated')
      return groupService.create(name || null, members)
    },
    onSuccess: () => {
      invalidateGroupQueries(queryClient, user?.id)
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
      invalidateGroupQueries(queryClient, user?.id, data?.projectId)
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
      invalidateGroupQueries(queryClient, user?.id, data?.projectId)
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
      invalidateGroupQueries(queryClient, user?.id)
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
      invalidateGroupQueries(queryClient, user?.id, data?.projectId)
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
      invalidateGroupQueries(queryClient, user?.id)
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
      invalidateGroupQueries(queryClient, user?.id, data?.projectId)
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
      invalidateGroupQueries(queryClient, user?.id)
      // Also invalidate specific group join requests if groupId is available
      if (data?.groupId) {
        queryClient.invalidateQueries({ queryKey: ['group-join-requests', data.groupId] })
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
      invalidateGroupQueries(queryClient, user?.id, data?.projectId)
    },
  })
}

export function useRejectJoinRequest() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: ({ requestId, comments }: { requestId: string; comments?: string }) => {
      return groupService.rejectJoinRequest(requestId, comments)
    },
    onSuccess: () => {
      invalidateGroupQueries(queryClient, user?.id)
    },
  })
}

export function useLeaveGroup() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: (groupId: string) => {
      return groupService.leave(groupId)
    },
    onSuccess: () => {
      invalidateGroupQueries(queryClient, user?.id)
    },
  })
}

export function useDeleteGroup() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: (groupId: string) => {
      return groupService.delete(groupId)
    },
    onSuccess: () => {
      invalidateGroupQueries(queryClient, user?.id)
    },
  })
}

export function useMyJoinRequests() {
  return useQuery({
    queryKey: ['my-join-requests'],
    queryFn: () => groupService.getMyJoinRequests(),
    staleTime: 0,
    refetchOnMount: true,
  })
}

export function useCancelJoinRequest() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: (requestId: string) => {
      return groupService.cancelJoinRequest(requestId)
    },
    onSuccess: () => {
      invalidateGroupQueries(queryClient, user?.id)
    },
  })
}