import { useQuery } from '@tanstack/react-query'
import { discussionCommitteeProjectService } from '../api/project.service'
import { useAuthStore } from '@/features/auth/store/auth.store'

export function useCommitteeProjects() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['discussion-committee-projects', user?.id],
    queryFn: () => {
      if (!user) throw new Error('User not authenticated')
      return discussionCommitteeProjectService.getAssignedProjects(user.id)
    },
    enabled: !!user,
  })
}

export function useCommitteeProject(id: string) {
  return useQuery({
    queryKey: ['discussion-committee-projects', id],
    queryFn: () => discussionCommitteeProjectService.getById(id),
    enabled: !!id,
  })
}
