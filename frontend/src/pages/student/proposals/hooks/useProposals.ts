import { useQuery } from '@tanstack/react-query'
import { proposalService } from '../api/proposal.service'

/**
 * Fetch all proposals
 */
export function useProposals() {
  return useQuery({
    queryKey: ['proposals'],
    queryFn: () => proposalService.getAll(),
    staleTime: 0,
    refetchOnMount: true,
  })
}

/**
 * Fetch a single proposal by ID
 */
export function useProposal(id: string) {
  return useQuery({
    queryKey: ['proposals', id],
    queryFn: () => proposalService.getById(id),
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: true,
  })
}
