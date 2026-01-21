import { useProposal } from '../hooks/useProposals'
import { useResubmitProposal } from '../hooks/useProposalOperations'
import { useToast } from '@/components/common'
// import { useTranslation } from 'react-i18next'

export function useProposalsView(proposalId: string) {
  // const { t } = useTranslation()
  const { success, error } = useToast() 

  const { data: proposal, isLoading } = useProposal(proposalId)
  const resubmitProposal = useResubmitProposal()

  const handleResubmit = async () => {
    if (!proposal) return

    try {
      await resubmitProposal.mutateAsync(proposal)
      success('proposal.resubmitSuccess')
      return true
    } catch (err) {
      error(err instanceof Error ? err.message : 'proposal.resubmitError')
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
