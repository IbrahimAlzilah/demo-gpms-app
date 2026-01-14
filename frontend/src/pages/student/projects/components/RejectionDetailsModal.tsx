import { useTranslation } from 'react-i18next'
import { ModalDialog } from '@/components/common'
import { XCircle, AlertCircle, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'
import type { ProjectRegistration } from '@/types/project.types'

interface RejectionDetailsModalProps {
  registration: ProjectRegistration | null
  open: boolean
  onClose: () => void
}

export function RejectionDetailsModal({
  registration,
  open,
  onClose,
}: RejectionDetailsModalProps) {
  const { t } = useTranslation()

  if (!registration) return null

  return (
    <ModalDialog
      open={open}
      onOpenChange={onClose}
      title={t('project.rejectionDetails')}
      description={t('project.rejectionDetailsDescription')}
    >
      <div className="space-y-4">
        {/* Rejection Status */}
        <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-destructive font-semibold mb-1">
              ❌ {t('project.registrationRejected')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('project.registrationRejectedDescription')}
            </p>
          </div>
        </div>

        {/* Rejection Comments */}
        {registration.reviewComments ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <h4 className="text-sm font-semibold">{t('project.rejectionComments')}</h4>
            </div>
            <div className="p-4 bg-background rounded-lg border-2 border-destructive/30 shadow-sm">
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {registration.reviewComments}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('project.rejectionCommentsDescription')}
            </p>
          </div>
        ) : (
          <div className="p-3 bg-muted/30 rounded-md border border-muted">
            <p className="text-sm text-muted-foreground">
              {t('project.noRejectionComments')}
            </p>
          </div>
        )}

        {/* Review Date */}
        {registration.reviewedAt && (
          <div className="flex items-center gap-2 pt-3 border-t text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {t('project.rejectedAt')}: {formatDate(registration.reviewedAt)}
            </span>
          </div>
        )}

        {/* What you can do */}
        <div className="p-3 bg-info/10 rounded-md border border-info/20">
          <p className="text-xs font-semibold text-info mb-2">
            {t('project.whatYouCanDo')}:
          </p>
          <ul className="space-y-1 text-xs text-muted-foreground list-disc list-inside">
            <li>{t('project.canRegisterAnother')}</li>
            {registration.reviewComments && (
              <li>{t('project.useCommentsToImprove')}</li>
            )}
          </ul>
        </div>
      </div>
    </ModalDialog>
  )
}
