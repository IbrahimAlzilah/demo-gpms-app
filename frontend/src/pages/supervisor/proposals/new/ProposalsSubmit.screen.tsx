import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BlockContent, ModalDialog } from '@/components/common'
import { Button } from '@/components/ui'
import {
  ArrowLeft,
  PlusCircle,
  Trash2,
  AlertCircle,
  Send,
  Loader2,
  Edit
} from 'lucide-react'
import { ROUTES } from '@/lib/constants/constants'
import { useProposalsSubmit } from './ProposalsSubmit.hook'
import { ProposalFields } from '../components/ProposalFields/ProposalFields'
import { cn } from '@/lib/utils'

export function ProposalsSubmit() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [showLockModal, setShowLockModal] = useState(false)

  const {
    proposals,
    addProposal,
    removeProposal,
    updateProposal,
    handleSubmit,
    isSubmitting,
    isLocked,
  } = useProposalsSubmit(() => {
    navigate(ROUTES.SUPERVISOR.MY_PROPOSALS)
  })

  // Check lock status when component mounts
  useEffect(() => {
    if (isLocked) {
      setShowLockModal(true)
    }
  }, [isLocked])

  const handleSubmitClick = async () => {
    if (isLocked) {
      setShowLockModal(true)
      return
    }

    if (proposals.length === 0) {
      return
    }

    await handleSubmit()
  }

  return (
    <>
      <BlockContent
        title={t('proposal.submitNew')}
        actions={
          <Button variant="outline" onClick={() => navigate(ROUTES.SUPERVISOR.MY_PROPOSALS)}>
            <ArrowLeft className="size-4 ltr:rotate-180" />
            {t('common.back')}
          </Button>
        }
      >
        <div className="space-y-6">
          {/* Lock Warning */}
          {isLocked && (
            <div className={cn(
              'flex items-start gap-3 p-4 rounded-lg border',
              'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
            )}>
              <div className="p-2 rounded-lg bg-amber-500/10 shrink-0">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  {t('proposal.submissionLocked')}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  {t('proposal.submissionLockedMessage')}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(ROUTES.SUPERVISOR.PROPOSALS_EDIT)}
                className="shrink-0"
              >
                <Edit className="h-4 w-4 me-1" />
                {t('proposal.editProposals')}
              </Button>
            </div>
          )}

          <div className="space-y-4">
            {proposals.map((proposal, index) => (
              <div key={proposal.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {t('proposal.proposal')} {index + 1}
                  </h3>
                  {proposals.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProposal(proposal.id)}
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
                  disabled={isSubmitting}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => addProposal()}
              disabled={isSubmitting || isLocked}
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
              onClick={handleSubmitClick}
              disabled={isSubmitting || proposals.length === 0 || isLocked}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t('proposal.submitting')}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {t('proposal.submit')}
                </>
              )}
            </Button>
          </div>
        </div>
      </BlockContent>

      {/* Lock Modal */}
      <ModalDialog
        open={showLockModal}
        onOpenChange={setShowLockModal}
        title={t('proposal.submissionNotAllowed')}
      >
        <div className="space-y-6">
          <div className={cn(
            'flex items-center gap-4 p-4 rounded-lg',
            'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800'
          )}>
            <div className="p-2 rounded-full bg-amber-500/20">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                {t('proposal.submissionLocked')}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                {t('proposal.submissionLockedMessage')}
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {t('proposal.submissionLockedDescription')}
          </p>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowLockModal(false)
                navigate(ROUTES.SUPERVISOR.MY_PROPOSALS)
              }}
            >
              {t('common.close')}
            </Button>
            <Button
              onClick={() => {
                setShowLockModal(false)
                navigate(ROUTES.SUPERVISOR.PROPOSALS_EDIT)
              }}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              {t('proposal.editProposals')}
            </Button>
          </div>
        </div>
      </ModalDialog>
    </>
  )
}
