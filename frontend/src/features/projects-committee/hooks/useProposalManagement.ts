import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { committeeProposalService } from '../api/proposal.service'
import { useAuthStore } from '../../auth/store/auth.store'

export function usePendingProposals() {
  return useQuery({
    queryKey: ['committee-proposals', 'pending'],
    queryFn: () => committeeProposalService.getPending(),
  })
}

export function useAllProposals() {
  return useQuery({
    queryKey: ['committee-proposals'],
    queryFn: () => committeeProposalService.getAll(),
  })
}

export function useProposal(id: string) {
  return useQuery({
    queryKey: ['committee-proposals', id],
    queryFn: () => committeeProposalService.getById(id),
    enabled: !!id,
  })
}

export function useApproveProposal() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId?: string }) => {
      if (!user) throw new Error('User not authenticated')
      return committeeProposalService.approve(id, user.id, projectId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['committee-proposals'] })
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
    },
  })
}

export function useRejectProposal() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: ({ id, reviewNotes }: { id: string; reviewNotes?: string }) => {
      if (!user) throw new Error('User not authenticated')
      return committeeProposalService.reject(id, user.id, reviewNotes)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['committee-proposals'] })
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
    },
  })
}

export function useRequestModification() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: ({ id, reviewNotes }: { id: string; reviewNotes: string }) => {
      if (!user) throw new Error('User not authenticated')
      return committeeProposalService.requestModification(id, user.id, reviewNotes)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['committee-proposals'] })
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
    },
  })
}

