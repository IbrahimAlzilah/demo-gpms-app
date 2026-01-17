import { useProposal } from '../hooks/useProposals'
import { useResubmitProposal } from '../hooks/useProposalOperations'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

export function useProposalsView(proposalId: string) {
  const { t } = useTranslation()

  const { data: proposal, isLoading } = useProposal(proposalId)
  const resubmitProposal = useResubmitProposal()

  const handleResubmit = async () => {
    if (!proposal) return

    try {
      await resubmitProposal.mutateAsync(proposal)
      toast.success(t('proposal.resubmitSuccess'))
      return true
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('proposal.resubmitError'))
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
