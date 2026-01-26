import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui'
import { StatusBadge } from '@/components/common'
import { 
  ChevronDown, 
  ChevronUp, 
  Users, 
  FileText, 
  Calendar,
  X,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react'
import { formatDate, formatRelativeTime } from '@/lib/utils/format'
import { cn } from '@/lib/utils'
import type { GroupRegistrationRequest, ProjectRegistration } from '@/types/project.types'
import { useCancelRegistration } from '../../hooks/useProjectOperations'
import { useToast } from '@/components/common'

interface RegistrationRequestCardProps {
  request: GroupRegistrationRequest
  onViewProject?: (projectId: string) => void
}

export function RegistrationRequestCard({
  request,
  onViewProject,
}: RegistrationRequestCardProps) {
  const { t } = useTranslation()
  const { toastSuccess, toastError } = useToast()
  const [isExpanded, setIsExpanded] = useState(false)
  const cancelRegistration = useCancelRegistration()

  const studentGroup = request.studentGroup
  const projectRegistrations = request.projectRegistrations || []

  const getStatusColor = (status: GroupRegistrationRequest['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
      case 'rejected':
        return 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800'
      case 'cancelled':
        return 'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800'
      default:
        return 'bg-muted/50 border-border'
    }
  }

  const getStatusIcon = (status: GroupRegistrationRequest['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
      case 'cancelled':
        return <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
      default:
        return <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
    }
  }

  const pendingProjects = projectRegistrations.filter(p => p.status === 'pending')
  const approvedProjects = projectRegistrations.filter(p => p.status === 'approved')
  const rejectedProjects = projectRegistrations.filter(p => p.status === 'rejected')

  const canCancel = request.status === 'pending' && pendingProjects.length > 0

  const handleCancel = async () => {
    if (!canCancel || !projectRegistrations[0]) return
    
    try {
      await cancelRegistration.mutateAsync(projectRegistrations[0].id)
      toastSuccess(t('registration.cancelSuccess') || 'Registration request cancelled successfully')
    } catch (err: any) {
      toastError(err?.response?.data?.message || err?.message || t('registration.cancelError') || 'Failed to cancel registration')
    }
  }

  return (
    <div className={cn(
      'rounded-lg border transition-all duration-200',
      getStatusColor(request.status),
      isExpanded && 'shadow-md'
    )}>
      {/* Header */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
            {/* Icon */}
            <div className="p-2 rounded-lg shrink-0 bg-primary/10 text-primary">
              {getStatusIcon(request.status)}
            </div>

            {/* Main Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-base sm:text-lg">
                  {t('registration.registrationRequest') || 'Registration Request'}
                </h3>
                <StatusBadge status={request.status} />
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-2">
                {t('registration.submittedAt')}: {formatRelativeTime(request.submittedAt)}
              </p>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  <span className="font-medium">
                    {projectRegistrations.length} {projectRegistrations.length === 1 ? t('registration.project') : t('registration.projects')}
                  </span>
                </div>
                
                {pendingProjects.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{pendingProjects.length} {t('registration.pending')}</span>
                  </div>
                )}

                {approvedProjects.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{approvedProjects.length} {t('registration.approved')}</span>
                  </div>
                )}

                {rejectedProjects.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <XCircle className="h-3.5 w-3.5" />
                    <span>{rejectedProjects.length} {t('registration.rejected')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {canCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={cancelRegistration.isPending}
                className="h-8"
              >
                {cancelRegistration.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <X className="h-4 w-4 mr-1" />
                    {t('registration.cancel')}
                  </>
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded Content - Projects List */}
      {isExpanded && (
        <div className="border-t border-border/50 bg-background/30 dark:bg-background/10 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold">
              {t('registration.projectsInRequest') || 'Projects in this request'} 
              <span className="text-muted-foreground font-normal ms-1">
                ({projectRegistrations.length})
              </span>
            </h4>
          </div>

          {projectRegistrations.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              {t('registration.noProjectsInRequest') || 'No projects found in this request'}
            </div>
          ) : (
            <div className="space-y-2">
              {projectRegistrations.map((registration) => {
                const project = registration.project
                if (!project) return null

                const isApproved = registration.status === 'approved'
                const isPending = registration.status === 'pending'
                const isRejected = registration.status === 'rejected'

                return (
                  <div
                    key={registration.id}
                    className={cn(
                      'p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50',
                      isApproved && 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-800',
                      isRejected && 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-200 dark:border-rose-800',
                      isPending && 'bg-background border-border'
                    )}
                    onClick={() => onViewProject?.(project.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium text-sm truncate">{project.title}</h5>
                          <StatusBadge status={registration.status} />
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {project.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {project.supervisor && (
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{project.supervisor.name}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{project.currentStudents}/{project.maxStudents}</span>
                          </div>
                        </div>
                        {registration.reviewComments && (
                          <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                            <p className="font-medium mb-1">{t('registration.reviewComments')}:</p>
                            <p className="text-muted-foreground">{registration.reviewComments}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Request Status Info */}
          {request.status === 'approved' && request.approvedProject && (
            <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100 mb-1">
                    {t('registration.requestApproved') || 'Request Approved'}
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    {t('registration.approvedProject', { project: request.approvedProject.title }) || 
                     `Approved project: ${request.approvedProject.title}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {request.status === 'rejected' && request.reviewComments && (
            <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-lg">
              <div className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-rose-900 dark:text-rose-100 mb-1">
                    {t('registration.requestRejected') || 'Request Rejected'}
                  </p>
                  <p className="text-xs text-rose-700 dark:text-rose-300">
                    {request.reviewComments}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
