import { useTranslation } from 'react-i18next'
import { ModalDialog, StatusBadge } from '@/components/common'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'
import { useRequestsView } from './RequestsView.hook'

interface RequestsViewProps {
  requestId: string
  open: boolean
  onClose: () => void
}

export function RequestsView({ requestId, open, onClose }: RequestsViewProps) {
  const { t } = useTranslation()
  const { request, isLoading, error } = useRequestsView(requestId)

  if (isLoading || !request) {
    return null
  }

  if (error) {
    return (
      <ModalDialog open={open} onOpenChange={onClose} title={t('request.request')}>
        <div className="text-center py-8 text-destructive">
          {t('request.loadError')}
        </div>
      </ModalDialog>
    )
  }

  return (
    <ModalDialog open={open} onOpenChange={onClose} title={t('request.request')}>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <StatusBadge status={request.status} />
          <span className="text-sm text-muted-foreground">
            {t('request.submittedAt')} {formatDate(request.createdAt)}
          </span>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
            {t('request.reason')}
          </h4>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {request.reason}
          </p>
        </div>

        {/* Workflow Timeline */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">{t('request.workflow')}</h4>

          {/* Submitted */}
          <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">{t('request.submitted')}</p>
              <p className="text-xs text-muted-foreground">{formatDate(request.createdAt)}</p>
            </div>
          </div>

          {/* Supervisor Decision */}
          {request.supervisorApproval ? (
            <div className={`flex items-start gap-3 p-3 rounded-lg ${
              request.supervisorApproval.approved
                ? 'bg-success/10'
                : 'bg-destructive/10'
            }`}>
              {request.supervisorApproval.approved ? (
                <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {t('request.supervisorDecision')}: {' '}
                  {request.supervisorApproval.approved
                    ? (t('request.approved'))
                    : (t('request.rejected'))
                  }
                </p>
                {request.supervisorApproval.comments && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {request.supervisorApproval.comments}
                  </p>
                )}
                {request.supervisorApproval.approvedAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(request.supervisorApproval.approvedAt)}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <Clock className="h-5 w-5 text-warning mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">{t('request.awaitingSupervisor')}</p>
              </div>
            </div>
          )}

          {/* Committee Decision */}
          {request.committeeApproval ? (
            <div className={`flex items-start gap-3 p-3 rounded-lg ${
              request.committeeApproval.approved
                ? 'bg-success/10'
                : 'bg-destructive/10'
            }`}>
              {request.committeeApproval.approved ? (
                <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {t('request.committeeDecision')}: {' '}
                  {request.committeeApproval.approved
                    ? (t('request.approved'))
                    : (t('request.rejected'))
                  }
                </p>
                {request.committeeApproval.comments && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {request.committeeApproval.comments}
                  </p>
                )}
                {request.committeeApproval.approvedAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(request.committeeApproval.approvedAt)}
                  </p>
                )}
              </div>
            </div>
          ) : request.supervisorApproval?.approved && (
            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <Clock className="h-5 w-5 text-warning mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">{t('request.awaitingCommittee')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalDialog>
  )
}
