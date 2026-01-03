import { useQuery } from '@tanstack/react-query'
import { committeeProposalService } from '../api/proposal.service'

/**
 * Fetch pending proposals
 */
export function usePendingProposals() {
  return useQuery({
    queryKey: ['committee-proposals', 'pending'],
    queryFn: () => committeeProposalService.getPending(),
  })
}

/**
 * Fetch all proposals
 */
export function useAllProposals() {
  return useQuery({
    queryKey: ['committee-proposals'],
    queryFn: () => committeeProposalService.getAll(),
  })
}

/**
 * Fetch a single proposal by ID
 */
export function useProposal(id: string) {
  return useQuery({
    queryKey: ['committee-proposals', id],
    queryFn: () => committeeProposalService.getById(id),
    enabled: !!id,
  })
}
