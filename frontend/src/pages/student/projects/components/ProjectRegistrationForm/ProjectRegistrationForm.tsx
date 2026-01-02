import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useRegisterProject,
  useProjectRegistration,
  useCancelRegistration,
} from '../../hooks/useProjectOperations'
import { usePeriodCheck } from '@/hooks/usePeriodCheck'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  User,
  Users,
  Loader2,
} from 'lucide-react'
import { formatDate } from '@/lib/utils/format'
import type { Project } from '@/types/project.types'

interface ProjectRegistrationFormProps {
  project: Project
  onSuccess?: () => void
  onCancel?: () => void
}

export function ProjectRegistrationForm({
  project,
  onSuccess,
  onCancel,
}: ProjectRegistrationFormProps) {
  const { t } = useTranslation()
  const registerProject = useRegisterProject()
  const cancelRegistration = useCancelRegistration()
  const { data: registration, isLoading: registrationLoading } = useProjectRegistration(project.id)
  const { isPeriodActive, isLoading: periodLoading } = usePeriodCheck('project_registration')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!isPeriodActive) {
      setError(t('project.periodClosed') || 'فترة التسجيل غير مفتوحة حالياً')
      return
    }

    if (project.currentStudents >= project.maxStudents) {
      setError(t('project.fullCapacity') || 'المشروع ممتلئ')
      return
    }

    setError('')
    setSuccess(false)
    try {
      await registerProject.mutateAsync(project.id)
      setSuccess(true)
      setTimeout(() => {
        onSuccess?.()
      }, 2000)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('project.registrationError') || 'فشل التسجيل في المشروع'
      )
    }
  }

  const handleCancelRegistration = async () => {
    if (!registration) return
    setError('')
    try {
      await cancelRegistration.mutateAsync(registration.id)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل إلغاء طلب التسجيل')
    }
  }

  if (registrationLoading || periodLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  // If there's a pending registration, show status
  if (registration && registration.status === 'pending') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-warning" />
            {t('project.registrationStatus') || 'حالة طلب التسجيل'}
          </CardTitle>
          <CardDescription>
            {t('project.registrationPending') || 'طلب التسجيل قيد المراجعة'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">{project.title}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
          </div>

          <div className="flex items-start gap-3 p-4 bg-info/10 border border-info/20 rounded-lg">
            <Clock className="h-5 w-5 text-info mt-0.5" />
            <div className="flex-1">
              <p className="text-info font-medium mb-1">
                {t('project.registrationPending') || 'طلب التسجيل قيد المراجعة'}
              </p>
              <p className="text-sm text-info/80">
                {t('project.registrationPendingMessage') ||
                  'تم إرسال طلب التسجيل إلى لجنة المشاريع. يرجى انتظار الموافقة.'}
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs text-info/60">
                <Calendar className="h-3 w-3" />
                <span>
                  {t('project.submittedAt') || 'تاريخ التقديم'}:{' '}
                  {formatDate(registration.submittedAt)}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={handleCancelRegistration}
              disabled={cancelRegistration.isPending}
              variant="outline"
              className="flex-1"
            >
              {cancelRegistration.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('project.cancelling') || 'جاري الإلغاء...'}
                </>
              ) : (
                t('project.cancelRegistration') || 'إلغاء طلب التسجيل'
              )}
            </Button>
            {onCancel && (
              <Button onClick={onCancel} variant="outline">
                {t('common.back') || 'العودة'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // If registration was approved or rejected
  if (registration && (registration.status === 'approved' || registration.status === 'rejected')) {
    const isApproved = registration.status === 'approved'
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isApproved ? (
              <CheckCircle2 className="h-5 w-5 text-success" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
            {t('project.registrationStatus') || 'حالة طلب التسجيل'}
          </CardTitle>
          <CardDescription>
            {isApproved
              ? t('project.registrationApproved') || 'تم قبول طلب التسجيل'
              : t('project.registrationRejected') || 'تم رفض طلب التسجيل'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">{project.title}</h4>
          </div>

          <div
            className={`flex items-start gap-3 p-4 rounded-lg ${
              isApproved
                ? 'bg-success/10 border border-success/20'
                : 'bg-destructive/10 border border-destructive/20'
            }`}
          >
            {isApproved ? (
              <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive mt-0.5" />
            )}
            <div className="flex-1">
              <p
                className={`font-medium mb-1 ${isApproved ? 'text-success' : 'text-destructive'}`}
              >
                {isApproved
                  ? t('project.registrationApproved') || 'تم قبول طلب التسجيل'
                  : t('project.registrationRejected') || 'تم رفض طلب التسجيل'}
              </p>
              {registration.reviewComments && (
                <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                  {registration.reviewComments}
                </p>
              )}
              {registration.reviewedAt && (
                <p className="text-xs text-muted-foreground mt-2">
                  {t('project.reviewedAt') || 'تمت المراجعة في'} {formatDate(registration.reviewedAt)}
                </p>
              )}
            </div>
          </div>

          {onCancel && (
            <Button onClick={onCancel} variant="outline" className="w-full">
              {t('common.back') || 'العودة'}
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          {t('project.registerInProject') || 'التسجيل في المشروع'}
        </CardTitle>
        <CardDescription>
          {t('project.registerDescription') || 'تأكد من تفاصيل المشروع قبل التسجيل'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">{project.title}</h4>
          <p className="text-sm text-muted-foreground line-clamp-3">{project.description}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">{t('project.supervisor') || 'المشرف'}</p>
              <p className="text-sm font-medium">
                {project.supervisor?.name || t('project.noSupervisor') || 'غير معين'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">
                {t('project.students') || 'عدد الطلاب'}
              </p>
              <p className="text-sm font-medium">
                {project.currentStudents}/{project.maxStudents}
                {project.currentStudents >= project.maxStudents && (
                  <span className="text-xs text-destructive ms-2">
                    ({t('project.full') || 'ممتلئ'})
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {!isPeriodActive && (
          <div className="flex items-start gap-2 p-3 text-sm text-warning bg-warning/10 border border-warning/20 rounded-md">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{t('project.periodClosed') || 'فترة التسجيل غير مفتوحة حالياً'}</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 p-3 text-sm text-success bg-success/10 border border-success/20 rounded-md">
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              {t('project.registrationSuccess') ||
                'تم إرسال طلب التسجيل بنجاح. يرجى انتظار الموافقة من لجنة المشاريع.'}
            </span>
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={handleSubmit}
            disabled={
              registerProject.isPending ||
              success ||
              !isPeriodActive ||
              project.currentStudents >= project.maxStudents
            }
            className="flex-1"
          >
            {registerProject.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('project.registering') || 'جاري التسجيل...'}
              </>
            ) : (
              t('project.confirmRegistration') || 'تأكيد التسجيل'
            )}
          </Button>
          {onCancel && (
            <Button onClick={onCancel} variant="outline">
              {t('common.cancel')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
