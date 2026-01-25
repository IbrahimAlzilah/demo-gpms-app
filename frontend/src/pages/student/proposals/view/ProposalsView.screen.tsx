import { ModalDialog, StatusBadge } from '@/components/common'
import { Button } from '@/components/ui'
import { MessageSquare, RotateCcw, Loader2, User, Users, Briefcase, Eye } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'
import { useTranslation } from 'react-i18next'
import { useProposalsView } from './ProposalsView.hook'
import type { Proposal } from '@/types/project.types'

interface ProposalsViewProps {
  proposalId: string
  open: boolean
  onClose: () => void
  onResubmit?: (proposal: Proposal) => void
  readOnly?: boolean
}

export function ProposalsView({
  proposalId,
  open,
  onClose,
  onResubmit,
  readOnly = false,
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
      title={proposal.title || ''}
    >
      <div className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Read-only indicator for group members */}
        {readOnly && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {t('proposal.readOnlyView')}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                {t('proposal.submittedByGroupLeader')}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 text-sm mb-4">
          <StatusBadge status={proposal.status} />
          {proposal.createdAt && (
            <span className="text-muted-foreground">
              {t('proposal.submittedAt')} {formatDate(proposal.createdAt)}
            </span>
          )}
        </div>

        {proposal.description && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">{t('proposal.description')}</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {proposal.description}
            </p>
          </div>
        )}

        {proposal.project && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">{t('proposal.associatedProject')}</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              {proposal.project.title}
            </p>
          </div>
        )}

        {proposal.submitter && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">{t('proposal.submitter')}</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              {proposal.submitter.name || proposal.submitter.email}
            </p>
          </div>
        )}

        {proposal.reviewer && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">{t('proposal.reviewer')}</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              {proposal.reviewer.name || proposal.reviewer.email}
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

        {proposal.updatedAt && proposal.updatedAt !== proposal.createdAt && (
          <div className="text-xs text-muted-foreground mb-4">
            {t('common.lastUpdated')} {formatDate(proposal.updatedAt)}
          </div>
        )}

        {/* Only show resubmit button for leaders (not in read-only mode) */}
        {!readOnly && proposal.status === 'requires_modification' && (
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
                  <RotateCcw className="size-4" />
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

