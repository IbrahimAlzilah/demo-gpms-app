import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { committeeProjectService } from '../api/project.service'

export function useApprovedProjects() {
  return useQuery({
    queryKey: ['committee-projects', 'draft'],
    queryFn: () => committeeProjectService.getDraft(),
  })
}

export function useAnnounceProjects() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (projectIds: string[]) => committeeProjectService.announce(projectIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['committee-projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

