import { useProposal } from '../hooks/useProposals'
import { useResubmitProposal } from '../hooks/useProposalOperations'
import { useToast } from '@/components/common'

export function useProposalsView(proposalId: string) {
  const { toastSuccess, toastError } = useToast()

  const { data: proposal, isLoading } = useProposal(proposalId)
  const resubmitProposal = useResubmitProposal()

  const handleResubmit = async () => {
    if (!proposal) return

    try {
      await resubmitProposal.mutateAsync(proposal)
      toastSuccess('proposal.resubmitSuccess')
      return true
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'proposal.resubmitError')
      return false
    }
  }

  return {
    proposal,
    isLoading,
    handleResubmit,
    isResubmitting: resubmitProposal.isPending,
  }
}
