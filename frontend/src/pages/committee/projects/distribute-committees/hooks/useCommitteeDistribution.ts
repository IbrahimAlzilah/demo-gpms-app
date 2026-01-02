import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { committeeDistributionService, type CommitteeAssignment } from '../api/committee.service'

export function useProjectsReadyForDiscussion() {
  return useQuery({
    queryKey: ['projects-ready-for-discussion'],
    queryFn: () => committeeDistributionService.getProjectsReadyForDiscussion(),
  })
}

export function useDiscussionCommitteeMembers() {
  return useQuery({
    queryKey: ['discussion-committee-members'],
    queryFn: () => committeeDistributionService.getDiscussionCommitteeMembers(),
  })
}

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
