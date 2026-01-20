import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { groupService } from '../api/group.service'
import { useAuthStore } from '@/pages/auth/login'
import type { User } from '@/types/user.types'

export function useGroupByProject(projectId: string) {
  return useQuery({
    queryKey: ['groups', 'project', projectId],
    queryFn: () => groupService.getByProjectId(projectId),
    enabled: !!projectId,
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
    refetchInterval: 30000,
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
    refetchInterval: 30000,
  })
}


// Mutations have been moved to useGroupOperations.ts


