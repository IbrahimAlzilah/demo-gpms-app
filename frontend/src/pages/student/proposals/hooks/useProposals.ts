import { useQuery } from '@tanstack/react-query'
import { proposalService } from '@/features/student/api/proposal.service'
import type { Proposal } from '@/types/project.types'

/**
 * Fetch all proposals
 */
export function useProposals() {
  return useQuery({
    queryKey: ['proposals'],
    queryFn: () => proposalService.getAll(),
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
  })
}
