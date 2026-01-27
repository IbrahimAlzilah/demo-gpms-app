import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { groupService } from '../api/group.service'
import { useAuthStore } from '@/pages/auth/login'
import type { User } from '@/types/user.types'

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


