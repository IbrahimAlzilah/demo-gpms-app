import { ModalDialog, StatusBadge, LoadingSpinner } from '@/components/common'
import { User, Briefcase, Calendar, MessageSquare, CheckCircle2, Building2, FileText } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'
import { useTranslation } from 'react-i18next'
import { useRegistration } from '../hooks/useRegistrations'

interface RegistrationDetailsViewProps {
  registrationId: string | null
  open: boolean
  onClose: () => void
}

export function RegistrationDetailsView({
  registrationId,
  open,
  onClose,
}: RegistrationDetailsViewProps) {
  const { t } = useTranslation()
  const { data: registration, isLoading } = useRegistration(registrationId || '')

  if (!open || !registrationId) {
    return null
  }

  if (isLoading) {
    return (
      <ModalDialog
        open={open}
        onOpenChange={onClose}
        title={t('registration.viewDetails') || 'تفاصيل طلب التسجيل'}
      >
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner />
        </div>
      </ModalDialog>
    )
  }

  if (!registration) {
    return null
  }

  return (
    <ModalDialog
      open={open}
      onOpenChange={onClose}
      title={t('registration.registrationDetails') || 'تفاصيل طلب التسجيل'}
      size="xl"
    >
      <div className="max-w-4xl max-h-[90vh] overflow-y-auto space-y-4">
        {/* Status and Dates */}
        <div className="flex items-center gap-4 text-sm pb-4 border-b">
          <StatusBadge status={registration.status} />
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{t('registration.submittedAt') || 'تاريخ التقديم'}: {formatDate(registration.submittedAt)}</span>
          </div>
          {registration.reviewedAt && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{t('registration.reviewedAt') || 'تاريخ المراجعة'}: {formatDate(registration.reviewedAt)}</span>
            </div>
          )}
        </div>

        {/* Student Information */}
        {registration.student && (
          <div className="p-4 rounded-lg bg-muted border border-muted-foreground/20">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold">{t('registration.student') || 'معلومات الطالب'}</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">{registration.student.name}</span>
              </div>
              {registration.student.email && (
                <div className="text-muted-foreground">
                  <span className="font-medium">{t('common.email') || 'البريد الإلكتروني'}: </span>
                  {registration.student.email}
                </div>
              )}
              {registration.student.studentId && (
                <div className="text-muted-foreground">
                  <span className="font-medium">{t('common.studentId') || 'رقم الطالب'}: </span>
                  {registration.student.studentId}
                </div>
              )}
              {registration.student.department && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-3 w-3" />
                  <span>
                    <span className="font-medium">{t('common.department') || 'القسم'}: </span>
                    {registration.student.department}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Project Information */}
        {registration.project && (
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold">{t('registration.project') || 'معلومات المشروع'}</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">{registration.project.title}</span>
              </div>
              {registration.project.description && (
                <div className="text-muted-foreground">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-3 w-3" />
                    <span className="font-medium">{t('project.description') || 'الوصف'}:</span>
                  </div>
                  <p className="whitespace-pre-wrap">{registration.project.description}</p>
                </div>
              )}
              {registration.project.supervisor && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>
                    <span className="font-medium">{t('project.supervisor') || 'المشرف'}: </span>
                    {registration.project.supervisor.name}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <StatusBadge status={registration.project.status} />
              </div>
              <div className="text-muted-foreground">
                <span className="font-medium">{t('project.students') || 'الطلاب'}: </span>
                {registration.project.currentStudents || 0} / {registration.project.maxStudents}
              </div>
              {registration.project.specialization && (
                <div className="text-muted-foreground">
                  <span className="font-medium">{t('project.specialization') || 'التخصص'}: </span>
                  {registration.project.specialization}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Review Information */}
        {(registration.reviewComments || registration.reviewedAt || registration.reviewedBy) && (
          <div className="p-4 rounded-lg bg-muted border border-muted-foreground/20">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold">{t('registration.reviewInformation') || 'معلومات المراجعة'}</h4>
            </div>
            
            {registration.reviewComments && (
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <h5 className="text-sm font-medium">{t('registration.reviewComments') || 'ملاحظات المراجعة'}</h5>
                </div>
                <p className="text-sm whitespace-pre-wrap bg-background p-3 rounded border border-border">
                  {registration.reviewComments}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              {registration.reviewedAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {t('registration.reviewedAt') || 'تاريخ المراجعة'}: {formatDate(registration.reviewedAt)}
                  </span>
                </div>
              )}
              {registration.reviewedBy && (
                <div>
                  <span>{t('registration.reviewedBy') || 'تمت المراجعة بواسطة'}: {registration.reviewedBy}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ModalDialog>
  )
}
