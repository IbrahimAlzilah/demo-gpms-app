import { useMutation, useQueryClient } from '@tanstack/react-query'
import { committeeProjectService } from '../api/project.service'

/**
 * Hook for announcing projects
 */
export function useAnnounceProjects() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (projectIds: string[]) => committeeProjectService.announce(projectIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['committee-projects'] })
      queryClient.invalidateQueries({ queryKey: ['committee-projects-announce'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
