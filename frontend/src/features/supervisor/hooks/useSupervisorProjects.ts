import { useQuery } from '@tanstack/react-query'
import { supervisorProjectService } from '../api/project.service'
import { useAuthStore } from '../../auth/store/auth.store'

export function useSupervisorProjects() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['supervisor-projects', user?.id],
    queryFn: () => {
      if (!user) throw new Error('User not authenticated')
      return supervisorProjectService.getAssignedProjects(user.id)
    },
    enabled: !!user,
  })
}

export function useSupervisorProject(id: string) {
  return useQuery({
    queryKey: ['supervisor-projects', id],
    queryFn: () => supervisorProjectService.getById(id),
    enabled: !!id,
  })
}

