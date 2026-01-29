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
      queryClient.invalidateQueries({ queryKey: ['projects-for-discussion'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['discussion-committee-members'] })
    },
  })
}

/**
 * Hook for removing committee assignment from a project
 */
export function useRemoveCommitteeAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (projectId: string) =>
      committeeDistributionService.removeAssignment(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects-ready-for-discussion'] })
      queryClient.invalidateQueries({ queryKey: ['projects-for-discussion'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['discussion-committee-members'] })
    },
  })
}

