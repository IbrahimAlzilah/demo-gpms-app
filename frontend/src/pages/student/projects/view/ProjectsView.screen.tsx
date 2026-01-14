import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui'
import { ModalDialog, LoadingSpinner, StatusBadge } from '@/components/common'
import { Users, User, Building2, FileText, Tag, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react'
import { useProjectsView } from './ProjectsView.hook'
import { formatDate } from '@/lib/utils/format'

interface ProjectsViewProps {
  projectId: string
  open: boolean
  onClose: () => void
  onRegister?: () => void
}

export function ProjectsView({ projectId, open, onClose, onRegister }: ProjectsViewProps) {
  const { t } = useTranslation()
  const { project, registration, isLoading, error } = useProjectsView(projectId)

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

  return (
    <ModalDialog 
      open={open} 
      onOpenChange={onClose} 
      title={project.title}
      description={t('project.projectDetails')}
    >
      <div className="space-y-6">
        {/* Title */}
        <div>
          <h3 className="text-lg font-semibold mb-1">{project.title}</h3>
          <div className="flex items-center gap-2 mt-2">
            <StatusBadge status={project.status} />
          </div>
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-medium">{t('project.description')}</h4>
          </div>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Project Information Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Supervisor */}
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="p-2 bg-background rounded-md">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">{t('project.supervisor')}</p>
              <p className="text-sm font-medium">
                {project.supervisor?.name || t('project.noSupervisor')}
              </p>
            </div>
          </div>

          {/* Students Count */}
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="p-2 bg-background rounded-md">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">{t('project.students')}</p>
              <p className="text-sm font-medium">
                {project.currentStudents}/{project.maxStudents}
              </p>
              {project.currentStudents >= project.maxStudents && (
                <p className="text-xs text-destructive mt-1">{t('project.full')}</p>
              )}
            </div>
          </div>

          {/* Specialization */}
          {project.specialization && (
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 bg-background rounded-md">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">{t('project.specialization')}</p>
                <p className="text-sm font-medium">{project.specialization}</p>
              </div>
            </div>
          )}

          {/* Status */}
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="p-2 bg-background rounded-md">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">{t('common.status')}</p>
              <StatusBadge status={project.status} />
            </div>
          </div>
        </div>

        {/* Keywords */}
        {project.keywords && project.keywords.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">{t('project.keywords')}</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {project.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary/10 text-primary border border-primary/20"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Registration Status */}
        {registration && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">{t('project.registrationStatus')}</h4>
            </div>
            
            {registration.status === 'pending' && (
              <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <Clock className="h-5 w-5 text-warning mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-warning font-semibold mb-1">
                    ⏰ {t('project.registrationPending')}
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    {t('project.registrationPendingDescription')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('project.submittedAt')}: {formatDate(registration.submittedAt)}
                  </p>
                </div>
              </div>
            )}

            {registration.status === 'approved' && (
              <div className="flex items-start gap-3 p-4 bg-success/10 border border-success/20 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-success font-semibold mb-1">
                    ✅ {t('project.registrationApproved')}
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    {t('project.registrationApprovedDescription')}
                  </p>
                  {registration.reviewedAt && (
                    <p className="text-xs text-muted-foreground">
                      {t('project.approvedAt')}: {formatDate(registration.reviewedAt)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {registration.status === 'rejected' && (
              <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-destructive font-semibold mb-1">
                    ❌ {t('project.registrationRejected')}
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    {t('project.registrationRejectedDescription')}
                  </p>
                  {registration.reviewComments ? (
                    <div className="mt-3 p-3 bg-background rounded-lg border-2 border-destructive/30 shadow-sm">
                      <div className="flex items-start gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-destructive mb-1">
                            {t('project.rejectionComments')}
                          </p>
                          <p className="text-xs text-muted-foreground mb-2">
                            {t('project.rejectionCommentsDescription')}
                          </p>
                        </div>
                      </div>
                      <div className="p-2 bg-muted/50 rounded-md border border-destructive/20">
                        <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                          {registration.reviewComments}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 p-2 bg-muted/30 rounded-md border border-muted">
                      <p className="text-xs text-muted-foreground">
                        {t('project.noRejectionComments')}
                      </p>
                    </div>
                  )}
                  {registration.reviewedAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {t('project.rejectedAt')}: {formatDate(registration.reviewedAt)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {registration.status === 'cancelled' && (
              <div className="flex items-start gap-3 p-4 bg-muted/50 border border-muted rounded-lg">
                <XCircle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-muted-foreground font-semibold mb-1">
                    🚫 {t('project.registrationCancelled')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('project.registrationCancelledDescription')}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          {/* Show register button if: no registration, or registration is cancelled, or rejected for different project */}
          {onRegister && 
            (!registration || 
             registration.status === 'cancelled' || 
             (registration.status === 'rejected' && registration.projectId !== projectId)) && (
            <Button onClick={onRegister} className="flex-1" size="lg">
              {t('project.register')}
            </Button>
          )}
          {/* Show message if rejected for same project */}
          {registration && registration.status === 'rejected' && registration.projectId === projectId && (
            <div className="flex-1 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive font-medium">
                {t('project.cannotReRegisterRejected')}
              </p>
            </div>
          )}
          {/* Show view details button if registration is pending or approved */}
          {registration && (registration.status === 'pending' || registration.status === 'approved') && (
            <Button 
              onClick={() => {
                // This will be handled by the parent component
                onRegister?.()
              }}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              {t('project.viewRegistrationDetails')}
            </Button>
          )}
          <Button variant="outline" onClick={onClose} size="lg">
            {t('common.close')}
          </Button>
        </div>
      </div>
    </ModalDialog>
  )
}
