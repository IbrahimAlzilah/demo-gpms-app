import { useQuery } from '@tanstack/react-query'
import { projectService } from '../api/project.service'
import { useAuthStore } from '@/pages/auth/login'

export function useProjects() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['supervisor-projects', user?.id],
    queryFn: () => {
      if (!user) throw new Error('User not authenticated')
      return projectService.getAssignedProjects(user.id)
    },
    enabled: !!user,
  })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['supervisor-projects', id],
    queryFn: () => projectService.getById(id),
    enabled: !!id,
  })
}

export function useSupervisorProjects() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['supervisor-projects', user?.id],
    queryFn: () => {
      if (!user) throw new Error('User not authenticated')
      return projectService.getAssignedProjects(user.id)
    },
    enabled: !!user,
  })
}

export function useSupervisorProject(id: string) {
  return useQuery({
    queryKey: ['supervisor-projects', id],
    queryFn: () => projectService.getById(id),
    enabled: !!id,
  })
}
