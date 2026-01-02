import { useProposal } from '../hooks/useProposals'
import { useResubmitProposal } from '../hooks/useProposalOperations'
import { useToast } from '@/components/common'
import { useTranslation } from 'react-i18next'

export function useProposalsView(proposalId: string) {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const { data: proposal, isLoading } = useProposal(proposalId)
  const resubmitProposal = useResubmitProposal()

  const handleResubmit = async () => {
    if (!proposal) return

    try {
      await resubmitProposal.mutateAsync(proposal)
      showToast(t('proposal.resubmitSuccess'), 'success')
      return true
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : t('proposal.resubmitError'),
        'error'
      )
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
