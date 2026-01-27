import { useQuery } from '@tanstack/react-query'
import { groupService } from '../api/group.service'
import { useAuthStore } from '@/pages/auth/login'

export function useGroupByProject(projectId: string) {
  return useQuery({
    queryKey: ['groups', 'project', projectId],
    queryFn: () => groupService.getByProjectId(projectId),
    enabled: !!projectId,
    staleTime: 0,
    refetchOnMount: true,
  })
}

export function useMyGroup() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['groups', 'student', user?.id],
    queryFn: () => {
      if (!user) throw new Error('User not authenticated')
      return groupService.getByStudentId(user.id)
    },
    enabled: !!user,
    staleTime: 0,
    refetchOnMount: true,
  })
}

export function useGroupInvitations() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['group-invitations', user?.id],
    queryFn: () => {
      if (!user) throw new Error('User not authenticated')
      return groupService.getInvitations(user.id)
    },
    enabled: !!user,
    staleTime: 0,
    refetchOnMount: true,
  })
}


// Mutations have been moved to useGroupOperations.ts

export function useGroupJoinRequests(groupId: string | undefined) {
  return useQuery({
    queryKey: ['group-join-requests', groupId],
    queryFn: () => {
      if (!groupId) throw new Error('Group ID is required')
      return groupService.getJoinRequests(groupId)
    },
    enabled: !!groupId,
    staleTime: 0,
    refetchOnMount: true,
  })
}


