import { useMutation, useQueryClient } from '@tanstack/react-query'
import { committeeDistributionService, type CommitteeAssignment } from '../api/committee.service'

/**
 * Hook for distributing projects to committees
 */
export function useDistributeProjects() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (assignments: CommitteeAssignment[]) =>
      committeeDistributionService.distributeProjects(assignments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects-ready-for-discussion'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
