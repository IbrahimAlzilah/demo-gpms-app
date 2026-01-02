import { ModalDialog, StatusBadge, useToast } from '@/components/common'
import { Button } from '@/components/ui'
import { MessageSquare, RotateCcw, Loader2 } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'
import { useTranslation } from 'react-i18next'
import { useProposalsView } from './ProposalsView.hook'

interface ProposalsViewProps {
  proposalId: string
  open: boolean
  onClose: () => void
  onResubmit?: (proposal: any) => void
}

export function ProposalsView({
  proposalId,
  open,
  onClose,
  onResubmit,
}: ProposalsViewProps) {
  const { t } = useTranslation()
  const { proposal, isLoading, handleResubmit, isResubmitting } =
    useProposalsView(proposalId)

  if (isLoading || !proposal) {
    return null
  }

  const handleResubmitClick = async () => {
    if (onResubmit) {
      onResubmit(proposal)
    } else {
      const success = await handleResubmit()
      if (success) {
        onClose()
      }
    }
  }

  return (
    <ModalDialog
      open={open}
      onOpenChange={onClose}
      title={proposal.title}
    >
      <div className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-4 text-sm mb-4">
          <StatusBadge status={proposal.status} />
          <span className="text-muted-foreground">
            {t('proposal.submittedAt')} {formatDate(proposal.createdAt)}
          </span>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">{t('proposal.description')}</h4>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {proposal.description}
          </p>
        </div>

        {proposal.objectives && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">{t('proposal.objectives')}</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {proposal.objectives}
            </p>
          </div>
        )}

        {proposal.methodology && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">{t('proposal.methodology')}</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {proposal.methodology}
            </p>
          </div>
        )}

        {proposal.expectedOutcomes && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">
              {t('proposal.expectedOutcomes')}
            </h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {proposal.expectedOutcomes}
            </p>
          </div>
        )}

        {proposal.reviewNotes && (
          <div className="rounded-lg bg-muted p-4 border border-muted-foreground/20 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">{t('proposal.reviewNotes')}</h4>
            </div>
            <p className="text-sm whitespace-pre-wrap">{proposal.reviewNotes}</p>
            {proposal.reviewedAt && (
              <p className="text-xs text-muted-foreground mt-2">
                {t('proposal.reviewedAt')} {formatDate(proposal.reviewedAt)}
              </p>
            )}
          </div>
        )}

        {proposal.status === 'requires_modification' && (
          <div className="mt-4 pt-4 border-t">
            <Button
              onClick={handleResubmitClick}
              className="w-full"
              disabled={isResubmitting}
            >
              {isResubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common.processing')}
                </>
              ) : (
                <>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {t('proposal.resubmit')}
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </ModalDialog>
  )
}
