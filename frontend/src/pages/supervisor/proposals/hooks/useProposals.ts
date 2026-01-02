import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { proposalService } from '../api/proposal.service'
import type { Proposal } from '@/types/project.types'

export function useProposals() {
  return useQuery({
    queryKey: ['supervisor-proposals'],
    queryFn: () => proposalService.getAll(),
  })
}

export function useProposal(id: string) {
  return useQuery({
    queryKey: ['supervisor-proposals', id],
    queryFn: () => proposalService.getById(id),
    enabled: !!id,
  })
}

export function useSupervisorProposals() {
  return useQuery({
    queryKey: ['supervisor-proposals'],
    queryFn: () => proposalService.getAll(),
  })
}

export function useSupervisorProposal(id: string) {
  return useQuery({
    queryKey: ['supervisor-proposals', id],
    queryFn: () => proposalService.getById(id),
    enabled: !!id,
  })
}

export function useCreateSupervisorProposal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt' | 'status'>) =>
      proposalService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supervisor-proposals'] })
      queryClient.invalidateQueries({ queryKey: ['supervisor-proposals-table'] })
    },
  })
}

export function useUpdateSupervisorProposal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Proposal> }) =>
      proposalService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['supervisor-proposals'] })
      queryClient.invalidateQueries({ queryKey: ['supervisor-proposals', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['supervisor-proposals-table'] })
    },
  })
}
