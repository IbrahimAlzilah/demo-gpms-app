import { useMutation, useQueryClient } from '@tanstack/react-query'
import { committeeProposalService } from '../api/proposal.service'
import { useAuthStore } from '@/pages/auth/login'
import type { Proposal } from '@/types/project.types'

/**
 * Hook for approving a proposal
 */
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
      queryClient.invalidateQueries({ queryKey: ['committee-proposals-table'] })
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
      // Invalidate projects queries to refresh approved projects list
      queryClient.invalidateQueries({ queryKey: ['committee-projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

/**
 * Hook for rejecting a proposal
 */
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
      queryClient.invalidateQueries({ queryKey: ['committee-proposals-table'] })
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
    },
  })
}

/**
 * Hook for requesting modification of a proposal
 */
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
      queryClient.invalidateQueries({ queryKey: ['committee-proposals-table'] })
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
    },
  })
}

/**
 * Hook for updating a proposal
 */
export function useUpdateProposal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Proposal> }) => {
      return committeeProposalService.update(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['committee-proposals'] })
      queryClient.invalidateQueries({ queryKey: ['committee-proposals-table'] })
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
    },
  })
}

/**
 * Hook for deleting a proposal
 */
export function useDeleteProposal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return committeeProposalService.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['committee-proposals'] })
      queryClient.invalidateQueries({ queryKey: ['committee-proposals-table'] })
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
    },
  })
}
