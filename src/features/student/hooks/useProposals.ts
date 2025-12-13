import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { proposalService } from '../api/proposal.service'
import type { Proposal } from '../../../types/project.types'

export function useProposals() {
  return useQuery({
    queryKey: ['proposals'],
    queryFn: () => proposalService.getAll(),
  })
}

export function useProposal(id: string) {
  return useQuery({
    queryKey: ['proposals', id],
    queryFn: () => proposalService.getById(id),
    enabled: !!id,
  })
}

export function useCreateProposal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt' | 'status'>) =>
      proposalService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
    },
  })
}

export function useUpdateProposal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Proposal> }) =>
      proposalService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
      queryClient.invalidateQueries({ queryKey: ['proposals', variables.id] })
    },
  })
}

