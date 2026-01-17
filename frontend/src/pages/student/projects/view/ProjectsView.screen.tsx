import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Textarea, Label } from '@/components/ui'
import { ModalDialog, LoadingSpinner, StatusBadge } from '@/components/common'
import { Users, User, CheckCircle2, AlertCircle, Info, Clock, Check } from 'lucide-react'
import { useProjectsView } from './ProjectsView.hook'
import { cn } from '@/lib/utils'

interface ProjectsViewProps {
  projectId: string
  open: boolean
  onClose: () => void
  onRegister?: () => void
}

export function ProjectsView({ projectId, open, onClose, onRegister }: ProjectsViewProps) {
  const { t } = useTranslation()
  const { project, isLoading, error } = useProjectsView(projectId)
  const [reason, setReason] = useState('')

  if (isLoading) {
    return (
      <ModalDialog open={open} onOpenChange={onClose} title={t('project.projectDetails')}>
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </ModalDialog>
    )
  }

  if (error || !project) {
    return (
      <ModalDialog open={open} onOpenChange={onClose} title={t('project.projectDetails')}>
        <div className="text-center py-8 text-destructive">
          {t('project.loadError')}
        </div>
      </ModalDialog>
    )
  }

  const title = onRegister
    ? `التسجيل في مشروع: ${project.title}`
    : project.title

  // If viewing only (no registration function), we might want to hide the reason input and eligibility check?
  // The user asked to "Refactor ... to use a single shared ModalDialog component".
  // If the component is "ProjectsView", it implies viewing.
  // But strictly speaking, the Registration form IS the view + extra fields.
  // Let's hide the registration specific fields if onRegister is undefined.

  const isRegistrationMode = !!onRegister;

  return (
    <ModalDialog
      open={open}
      onOpenChange={onClose}
      title={title}
      className="lg:max-w-3xl"
    >
      <div className="space-y-6">

        {/* Project Information Card */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-foreground">معلومات المشروع</h3>
          </div>

          <div className="grid gap-2 text-sm">
            <div className="grid grid-cols-[80px_1fr] items-start gap-2">
              <span className="font-semibold text-foreground">العنوان:</span>
              <span className="text-muted-foreground">{project.title}</span>
            </div>

            <div className="grid grid-cols-[80px_1fr] items-start gap-2">
              <span className="font-semibold text-foreground">الوصف:</span>
              <span className="text-muted-foreground leading-relaxed">
                {project.description}
              </span>
            </div>

            <div className="grid grid-cols-[80px_1fr] items-center gap-2">
              <span className="font-semibold text-foreground">المشرف:</span>
              <span className="text-muted-foreground">{project.supervisor?.name || t('project.noSupervisor')}</span>
            </div>

            {/* Preserved Data: Student Count & Status */}
            <div className="grid grid-cols-[80px_1fr] items-center gap-2">
              <span className="font-semibold text-foreground">{t('project.students')}:</span>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{project.currentStudents}/{project.maxStudents}</span>
                {project.currentStudents >= project.maxStudents && (
                  <span className="text-xs text-destructive">({t('project.full')})</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-[80px_1fr] items-center gap-2">
              <span className="font-semibold text-foreground">{t('common.status')}:</span>
              <div>
                <StatusBadge status={project.status} />
              </div>
            </div>
          </div>
        </div>

        {/* Reason for Choosing - Only in Registration Mode */}
        {isRegistrationMode && (
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-foreground">سبب اختيار المشروع (اختياري)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="اذكر سبب اختيارك لهذا المشروع..."
              className="min-h-[100px] resize-none bg-background"
            />
          </div>
        )}

        {/* Eligibility Check - Only in Registration Mode */}
        {isRegistrationMode && (
          <div className="border border-green-200 bg-green-50/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-green-700 font-semibold border-b border-green-200 pb-2">
              <CheckCircle2 className="h-5 w-5" />
              <span>مؤهل للتسجيل</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-foreground">الساعات المطلوبة</span>
                </div>
                <span className="text-green-700 font-bold dir-ltr">120/100</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-foreground">المعدل التراكمي</span>
                </div>
                <span className="text-muted-foreground dir-ltr">3.50 / الحد الأدنى: 2.5</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="font-medium text-foreground">عدم التسجيل في مشروع آخر</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-foreground">المتطلبات الأساسية</span>
                </div>
                <span className="text-green-700 font-medium">مكتملة</span>
              </div>
            </div>
          </div>
        )}

        {/* Note - Only in Registration Mode */}
        {isRegistrationMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-blue-700 font-semibold text-sm mb-1">ملاحظة:</h4>
            <p className="text-blue-600 text-sm">
              سيتم إرسال طلب التسجيل إلى لجنة المشاريع للمراجعة. سيتم إشعارك بالقرار عند مراجعة الطلب.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-2">
          {isRegistrationMode ? (
            <>
              <Button variant="outline" onClick={onClose} className="min-w-[100px]">
                إلغاء
              </Button>
              <Button onClick={onRegister} className="min-w-[140px] bg-[#1e293b] hover:bg-[#0f172a]">
                إرسال طلب التسجيل
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose}>
              {t('common.close')}
            </Button>
          )}
        </div>
      </div>
    </ModalDialog>
  )
}
