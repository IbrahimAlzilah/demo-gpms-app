import { useMutation, useQueryClient } from '@tanstack/react-query'
import { groupService } from '../api/group.service'
import { useAuthStore } from '@/features/auth/store/auth.store'
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}

export function useAddGroupMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ groupId, member }: { groupId: string; member: User }) =>
      groupService.addMember(groupId, member),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}

export function useRemoveGroupMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ groupId, memberId }: { groupId: string; memberId: string }) =>
      groupService.removeMember(groupId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
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
      queryClient.invalidateQueries({ queryKey: ['group-invitations'] })
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      queryClient.invalidateQueries({ queryKey: ['group-invitations'] })
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
      queryClient.invalidateQueries({ queryKey: ['group-invitations'] })
    },
  })
}

export function useJoinGroup() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: (groupId: string) => {
      if (!user) throw new Error('User not authenticated')
      return groupService.joinGroup(groupId, user.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}
