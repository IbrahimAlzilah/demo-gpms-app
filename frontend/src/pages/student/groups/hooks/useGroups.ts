import { useQuery } from '@tanstack/react-query'
import { groupService } from '@/features/student/api/group.service'
import { useAuthStore } from '@/features/auth/store/auth.store'

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
  })
}
