import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supervisorProposalService } from '../api/proposal.service'
import type { Proposal } from '../../../types/project.types'

export function useSupervisorProposals() {
  return useQuery({
    queryKey: ['supervisor-proposals'],
    queryFn: () => supervisorProposalService.getAll(),
  })
}

export function useSupervisorProposal(id: string) {
  return useQuery({
    queryKey: ['supervisor-proposals', id],
    queryFn: () => supervisorProposalService.getById(id),
    enabled: !!id,
  })
}

export function useCreateSupervisorProposal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt' | 'status'>) =>
      supervisorProposalService.create(data),
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
      supervisorProposalService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['supervisor-proposals'] })
      queryClient.invalidateQueries({ queryKey: ['supervisor-proposals', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['supervisor-proposals-table'] })
    },
  })
}
