import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui'
import { ModalDialog, LoadingSpinner } from '@/components/common'
import { Users, User, Building2 } from 'lucide-react'
import { useProjectsView } from './ProjectsView.hook'

interface ProjectsViewProps {
  projectId: string
  open: boolean
  onClose: () => void
  onRegister?: () => void
}

export function ProjectsView({ projectId, open, onClose, onRegister }: ProjectsViewProps) {
  const { t } = useTranslation()
  const { project, isLoading, error } = useProjectsView(projectId)

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
          {t('project.loadError') || 'حدث خطأ أثناء تحميل تفاصيل المشروع'}
        </div>
      </ModalDialog>
    )
  }

  return (
    <ModalDialog open={open} onOpenChange={onClose} title={t('project.projectDetails')}>
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">{t('project.description')}</h4>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{project.description}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">{t('project.supervisor')}</p>
              <p className="text-sm font-medium">
                {project.supervisor?.name || t('project.noSupervisor')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">{t('project.students')}</p>
              <p className="text-sm font-medium">
                {project.currentStudents}/{project.maxStudents}
              </p>
            </div>
          </div>
          {project.specialization && (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t('project.specialization')}</p>
                <p className="text-sm font-medium">{project.specialization}</p>
              </div>
            </div>
          )}
        </div>

        {project.keywords && project.keywords.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">{t('project.keywords')}</h4>
            <div className="flex flex-wrap gap-2">
              {project.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs rounded-md bg-muted text-muted-foreground"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t">
          {onRegister && (
            <Button onClick={onRegister} className="flex-1">
              {t('project.register')}
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            {t('common.close')}
          </Button>
        </div>
      </div>
    </ModalDialog>
  )
}
