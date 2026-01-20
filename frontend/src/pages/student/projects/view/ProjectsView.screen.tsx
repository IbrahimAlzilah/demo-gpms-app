import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Textarea, Label } from '@/components/ui'
import { ModalDialog, LoadingSpinner, StatusBadge } from '@/components/common'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { useProjectsView } from './ProjectsView.hook'
import { useMyGroup } from '@/pages/student/groups/hooks/useGroups'

interface ProjectsViewProps {
  projectId: string
  open: boolean
  onClose: () => void
  onRegister?: () => void
}

export function ProjectsView({ projectId, open, onClose, onRegister }: ProjectsViewProps) {
  const { t } = useTranslation()
  const { project, isLoading, error } = useProjectsView(projectId)
  const { data: studentGroup, isLoading: groupLoading } = useMyGroup()
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
              placeholder={t('project.registerDescription')}
              className="min-h-[100px] resize-none bg-background"
            />
          </div>
        )}

        {/* Note: Eligibility is determined by backend - no hardcoded checks */}

        {/* Note - Only in Registration Mode */}
        {isRegistrationMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-blue-700 font-semibold text-sm mb-1">ملاحظة:</h4>
            <p className="text-blue-600 text-sm">
              سيتم إرسال طلب التسجيل إلى لجنة المشاريع للمراجعة. سيتم إشعارك بالقرار عند مراجعة الطلب.
            </p>
          </div>
        )}

        {/* Group Requirement Warning - Only in Registration Mode */}
        {isRegistrationMode && !studentGroup && !groupLoading && (
          <div className="flex items-start gap-2 p-3 text-sm text-warning bg-warning/10 border border-warning/20 rounded-md">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium mb-1">{t('project.noGroupRequired')}</p>
              <p className="text-xs text-muted-foreground">
                {t('project.createGroupFirst')}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-2">
          {isRegistrationMode ? (
            <>
              <Button variant="outline" onClick={onClose} className="min-w-[100px]">
                إلغاء
              </Button>
              <Button 
                onClick={onRegister} 
                disabled={!studentGroup || groupLoading}
                className="min-w-[140px] bg-[#1e293b] hover:bg-[#0f172a]"
              >
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
