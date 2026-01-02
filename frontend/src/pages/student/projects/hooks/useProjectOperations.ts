import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { projectService } from '@/features/student/api/project.service'
import { useAuthStore } from '@/features/auth/store/auth.store'
import type { ProjectRegistration } from '@/types/project.types'

/**
 * Hook for fetching student registrations
 */
export function useStudentRegistrations() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['project-registrations', user?.id],
    queryFn: () => {
      if (!user) throw new Error('User not authenticated')
      return projectService.getStudentRegistrations(user.id)
    },
    enabled: !!user,
  })
}

/**
 * Hook for fetching a project registration by project ID
 */
export function useProjectRegistration(projectId: string) {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['project-registration', projectId, user?.id],
    queryFn: () => {
      if (!user) throw new Error('User not authenticated')
      return projectService.getRegistrationByProject(projectId, user.id)
    },
    enabled: !!user && !!projectId,
  })
}

/**
 * Hook for registering in a project
 */
export function useRegisterProject() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: (projectId: string) => {
      if (!user) throw new Error('User not authenticated')
      return projectService.register(projectId, user.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project-registrations'] })
      queryClient.invalidateQueries({ queryKey: ['available-projects-table'] })
      queryClient.invalidateQueries({ queryKey: ['project-registration'] })
    },
  })
}

/**
 * Hook for canceling a project registration
 */
export function useCancelRegistration() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: (registrationId: string) => {
      if (!user) throw new Error('User not authenticated')
      return projectService.cancelRegistration(registrationId, user.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-registrations'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['available-projects-table'] })
      queryClient.invalidateQueries({ queryKey: ['project-registration'] })
    },
  })
}
