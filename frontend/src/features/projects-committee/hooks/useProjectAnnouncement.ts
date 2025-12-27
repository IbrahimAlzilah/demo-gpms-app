import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { committeeProjectService } from '../api/project.service'

export function useApprovedProjects() {
  return useQuery({
    queryKey: ['committee-projects', 'approved'],
    queryFn: () => committeeProjectService.getApproved(),
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

