import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui'
import { ModalDialog, LoadingSpinner, StatusBadge } from '@/components/common'
import { AlertCircle } from 'lucide-react'
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


        {/* Note: Eligibility is determined by backend - no hardcoded checks */}

        {/* Note - Only in Registration Mode */}
        {isRegistrationMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-blue-700 font-semibold text-sm mb-1">{t('common.note') || 'Note'}:</h4>
            <p className="text-blue-600 text-sm">
              {t('project.registrationReviewRequest') || 'Your registration request will be sent to the Project Committee for review. You will be notified of the decision.'}
            </p>
          </div>
        )}

        {/* Assigned Group Warning - Show if project is assigned to another group */}
        {project.assignedGroup && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-2 text-amber-800">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">
                  {t('project.projectAssignedToAnotherGroup') || '⚠️ This project is already assigned to another group'}
                </h4>
                <p className="text-sm mt-1 opacity-90">
                  {t('project.canStillRegisterDescription') || 'You can still submit a request. The Committee will review the conflict.'}
                </p>
              </div>
            </div>

            {/* Assigned Group Details */}
            <div className="bg-white/50 rounded p-3 text-sm space-y-2 border border-amber-100">
              <div className="font-medium text-amber-900 border-b border-amber-100 pb-1 mb-2">
                {t('project.assignedGroupDetails') || 'Assigned Group Details'}
              </div>

              <div className="grid grid-cols-[100px_1fr] gap-2">
                <span className="text-muted-foreground">{t('project.groupLeader') || 'Leader'}:</span>
                <span className="font-medium">{project.assignedGroup.leader?.name}</span>
              </div>

              {project.assignedGroup.members && project.assignedGroup.members.length > 0 && (
                <div className="grid grid-cols-[100px_1fr] gap-2">
                  <span className="text-muted-foreground">{t('common.members') || 'Members'}:</span>
                  <div className="flex flex-wrap gap-1">
                    {project.assignedGroup.members.map((member) => (
                      <span key={member.id} className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-xs border border-amber-200">
                        {member.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
                {t('common.cancel')}
              </Button>
              <Button
                onClick={onRegister}
                disabled={!studentGroup || groupLoading}
                className="min-w-[140px] bg-[#1e293b] hover:bg-[#0f172a]"
              >
                {t('project.submitRegistrationRequest') || 'Submit Registration Request'}
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
