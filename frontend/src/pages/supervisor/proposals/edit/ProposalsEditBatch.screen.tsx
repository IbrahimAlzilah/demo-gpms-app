import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BlockContent, LoadingSpinner } from '@/components/common'
import { Button } from '@/components/ui'
import { ArrowLeft, PlusCircle, Trash2, AlertCircle, Loader2, Save } from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { useAuthStore } from '@/pages/auth/login'
import { useProposalsEditBatch } from './ProposalsEditBatch.hook'
import { ProposalFields } from '../components/ProposalFields/ProposalFields'

export function ProposalsEditBatch() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const {
    existingProposals,
    newProposals,
    addNewProposal,
    removeNewProposal,
    updateProposal,
    handleSubmit,
    isLoading,
    isSubmitting,
    editBlocked,
    blockReason,
  } = useProposalsEditBatch(() => {
    navigate(ROUTES.SUPERVISOR.MY_PROPOSALS)
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  // Check if editing is blocked
  // For supervisors: allow empty proposals (they can add new ones)
  // For students: block when no proposals (they need group proposals)
  if (editBlocked) {
    return (
      <BlockContent
        title={t('proposal.edit')}
        variant="container"
      >
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {t('proposal.cannotEditTitle') || 'Editing Not Allowed'}
          </h3>
          <p className="text-muted-foreground max-w-md mb-2">
            {blockReason || t('proposal.cannotEditApproved') || 'Editing is not allowed at this time.'}
          </p>
          <p className="text-sm text-muted-foreground max-w-md mb-6">
            {t('proposal.editBlockedDescription') ||
              'You can only edit proposals when all proposals are in pending review status and no proposal has been approved.'}
          </p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => navigate(ROUTES.SUPERVISOR.MY_PROPOSALS)}
          >
            <ArrowLeft className="size-4 ltr:rotate-180" />
            {t('common.back')}
          </Button>
        </div>
      </BlockContent>
    )
  }

  const allProposals = [...existingProposals, ...newProposals]

  // Only pending_review and requires_modification (or new) can be edited; approved/rejected are read-only
  const isProposalEditable = (p: (typeof allProposals)[0]) =>
    p.isNew === true || p.status === 'pending_review' || p.status === 'requires_modification'

  const hasEditableExisting = existingProposals.some(
    p => p.status === 'pending_review' || p.status === 'requires_modification'
  )
  const canSave = hasEditableExisting || newProposals.length > 0

  return (
    <BlockContent
      title={t('proposal.edit')}
      actions={
        <Button variant="outline" onClick={() => navigate(ROUTES.SUPERVISOR.MY_PROPOSALS)}>
          <ArrowLeft className="size-4 ltr:rotate-180" />
          {t('common.back')}
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="space-y-4">
          {allProposals.map((proposal, index) => {
            const editable = isProposalEditable(proposal)
            return (
              <div key={proposal.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {proposal.isNew ? t('proposal.newProposal') : `${t('proposal.proposal')} ${index + 1}`}
                    {!proposal.isNew && proposal.status && (
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        ({proposal.status === 'pending_review' ? t('proposal.status.pendingReview') : proposal.status === 'requires_modification' ? t('proposal.status.requiresModification') : t(`proposal.status.${proposal.status}`)})
                      </span>
                    )}
                  </h3>
                  {proposal.isNew && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNewProposal(proposal.id)}
                      disabled={isSubmitting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <ProposalFields
                  proposal={proposal}
                  onChange={(data) => updateProposal(proposal.id, data)}
                  errors={proposal.errors}
                  disabled={isSubmitting || !editable}
                />
              </div>
            )
          })}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => addNewProposal()}
            disabled={isSubmitting}
          >
            <PlusCircle className="size-4" />
            {t('proposal.addNewProposal')}
          </Button>
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.SUPERVISOR.MY_PROPOSALS)}
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !canSave}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t('proposal.updating')}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t('proposal.update')}
              </>
            )}
          </Button>
        </div>
      </div>
    </BlockContent>
  )
}
