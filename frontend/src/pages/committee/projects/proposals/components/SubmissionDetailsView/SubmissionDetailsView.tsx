import { ModalDialog, StatusBadge } from '@/components/common'
import { User, Users, Calendar, FileText, CheckCircle2, MessageSquare, Briefcase } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { committeeSubmissionService } from '../../api/submission.service'
import { LoadingSpinner } from '@/components/common'
import type { ProposalSubmission } from '@/types/project.types'

interface SubmissionDetailsViewProps {
  submissionId: string
  open: boolean
  onClose: () => void
}

export function SubmissionDetailsView({
  submissionId,
  open,
  onClose,
}: SubmissionDetailsViewProps) {
  const { t } = useTranslation()
  
  const { data: submission, isLoading } = useQuery({
    queryKey: ['committee-submission', submissionId],
    queryFn: () => committeeSubmissionService.getById(submissionId),
    enabled: open && !!submissionId,
  })

  if (!open || !submissionId) {
    return null
  }

  if (isLoading) {
    return (
      <ModalDialog open={open} onOpenChange={onClose} title={t('proposal.submissionDetails')} size="xl">
        <LoadingSpinner />
      </ModalDialog>
    )
  }

  if (!submission) {
    return null
  }

  return (
    <ModalDialog
      open={open}
      onOpenChange={onClose}
      title={t('proposal.submissionDetails')}
      size="xl"
    >
      <div className="space-y-4">
        {/* Status and Dates */}
        <div className="flex items-center gap-4 text-sm pb-4 border-b">
          <StatusBadge status={submission.status} />
          {submission.submittedAt && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{t('proposal.submittedAt')} {formatDate(submission.submittedAt)}</span>
            </div>
          )}
        </div>

        {/* Submitter Information */}
        {submission.submitter && (
          <div className="p-4 rounded-lg bg-muted border border-muted-foreground/20">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold">{t('proposal.submitter')}</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">{submission.submitter.name}</span>
              </div>
              {submission.submitter.email && (
                <div className="text-muted-foreground">
                  <span className="font-medium">{t('common.email')}: </span>
                  {submission.submitter.email}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Student Group */}
        {submission.studentGroup && (
          <div className="p-4 rounded-lg bg-muted border border-muted-foreground/20">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold">{t('proposal.studentGroup')}</h4>
            </div>
            <div className="text-sm">
              <span className="font-medium">{submission.studentGroup.name || submission.studentGroup.groupCode}</span>
            </div>
          </div>
        )}

        {/* Proposals List */}
        {submission.proposals && submission.proposals.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">{t('proposal.proposals')} ({submission.proposals.length})</h4>
            {submission.proposals.map((proposal, index) => (
              <div key={proposal.id} className="p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <h5 className="text-sm font-semibold">
                    {t('proposal.proposal')} {index + 1}: {proposal.title}
                  </h5>
                  <StatusBadge status={proposal.status} />
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-3">
                  {proposal.description}
                </p>
                {proposal.proposedSupervisor && (
                  <div className="text-xs text-muted-foreground mb-2">
                    <span className="font-medium">{t('proposal.proposedSupervisor')}: </span>
                    {proposal.proposedSupervisor.name}
                  </div>
                )}
                {proposal.project && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Briefcase className="h-3 w-3" />
                    <span>
                      <span className="font-medium">{t('proposal.linkedProject')}: </span>
                      {proposal.project.title}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Review Information */}
        {(submission.reviewNotes || submission.reviewedAt || submission.reviewer) && (
          <div className="p-4 rounded-lg bg-muted border border-muted-foreground/20">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold">{t('proposal.reviewInformation')}</h4>
            </div>

            {submission.reviewer && (
              <div className="mb-3 pb-3 border-b border-muted-foreground/20">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    {t('proposal.reviewer')}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">{submission.reviewer.name}</span>
                  {submission.reviewer.email && (
                    <span className="text-muted-foreground ml-2">({submission.reviewer.email})</span>
                  )}
                </div>
              </div>
            )}

            {submission.reviewNotes && (
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <h5 className="text-sm font-medium">{t('proposal.reviewNotes')}</h5>
                </div>
                <p className="text-sm whitespace-pre-wrap bg-background p-3 rounded border border-border">
                  {submission.reviewNotes}
                </p>
              </div>
            )}

            {submission.reviewedAt && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>
                  {t('proposal.reviewedAt')}: {formatDate(submission.reviewedAt)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </ModalDialog>
  )
}
