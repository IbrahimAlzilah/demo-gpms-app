import { useQuery } from '@tanstack/react-query'
import { committeeDistributionService } from '../api/committee.service'

/**
 * Fetch projects ready for discussion
 */
export function useDistributeCommittees() {
  return useQuery({
    queryKey: ['projects-ready-for-discussion'],
    queryFn: () => committeeDistributionService.getProjectsReadyForDiscussion(),
  })
}

/**
 * Fetch discussion committee members
 */
export function useDiscussionCommitteeMembers() {
  return useQuery({
    queryKey: ['discussion-committee-members'],
    queryFn: () => committeeDistributionService.getDiscussionCommitteeMembers(),
  })
}
