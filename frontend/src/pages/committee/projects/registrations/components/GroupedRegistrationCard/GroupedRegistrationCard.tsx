import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui'
import { StatusBadge } from '@/components/common'
import { 
  ChevronDown, 
  ChevronUp, 
  Users, 
  User, 
  FileText, 
  Calendar,
  Eye,
  Check,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { formatDate, formatRelativeTime } from '@/lib/utils/format'
import { cn } from '@/lib/utils'
import type { GroupRegistrationRequest, ProjectRegistration } from '@/types/project.types'

interface GroupedRegistrationCardProps {
  request: GroupRegistrationRequest
  onViewRegistration: (registration: ProjectRegistration) => void
  onApproveProject?: (requestId: string, projectId: string) => void
  onRejectRequest?: (requestId: string) => void
  isLoadingAction?: (requestId: string) => boolean
}

export function GroupedRegistrationCard({
  request,
  onViewRegistration,
  onApproveProject,
  onRejectRequest,
  isLoadingAction,
}: GroupedRegistrationCardProps) {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)

  const studentGroup = request.studentGroup
  const submitter = request.submitter || request.submittedBy
  const projectRegistrations = Array.isArray(request.projectRegistrations) ? request.projectRegistrations : []

  // Safety checks
  if (!request) {
    return null
  }

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

  const getStatusLabel = (status: GroupRegistrationRequest['status']) => {
    switch (status) {
      case 'approved':
        return t('registration.approved')
      case 'rejected':
        return t('registration.rejected')
      case 'cancelled':
        return t('common.cancelled')
      default:
        return t('registration.pending')
    }
  }

  const pendingProjects = projectRegistrations.filter(p => p.status === 'pending')
  const approvedProjects = projectRegistrations.filter(p => p.status === 'approved')
  const rejectedProjects = projectRegistrations.filter(p => p.status === 'rejected')

  const isLoading = isLoadingAction?.(request.id) || false

  return (
    <div className={cn(
      'rounded-lg border transition-all duration-200',
      // This is commented out because we don't want to show the status color in the card
      // getStatusColor(request.status), 
      isExpanded && 'shadow-md'
    )}>
      {/* Header */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
            {/* Icon */}
            <div className="p-2 rounded-lg shrink-0 bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>

            {/* Main Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-base sm:text-lg truncate">
                  {studentGroup?.name || studentGroup?.groupCode || `Group ${request.studentGroupId || 'N/A'}`}
                </h3>
                <StatusBadge status={request.status || 'pending'} />
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                {projectRegistrations.length === 1 
                  ? t('registration.project', { defaultValue: 'Project' })
                  : `${projectRegistrations.length} ${t('registration.projects', { defaultValue: 'Projects' })}`}
              </p>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  <span className="font-medium">
                    {projectRegistrations.length} {projectRegistrations.length === 1 
                      ? t('registration.project', { defaultValue: 'Project' })
                      : t('registration.projects', { defaultValue: 'Projects' })}
                  </span>
                </div>
                
                {studentGroup && (
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    <span>
                      {studentGroup.memberCount || studentGroup.members?.length || 0} {t('common.members')}
                    </span>
                  </div>
                )}

                {submitter && (
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[150px]">
                      {(typeof submitter === 'object' ? submitter.name || submitter.email : submitter) || 'Unknown'}
                    </span>
                  </div>
                )}

                {request.submittedAt && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatRelativeTime(request.submittedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
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
                const project = registration?.project
                if (!project || !registration) {
                  return (
                    <div key={registration?.id || 'unknown'} className="p-3 rounded-lg border border-dashed text-xs text-muted-foreground">
                      {t('registration.invalidRegistration') || 'Invalid registration data'}
                    </div>
                  )
                }

                const isApproved = registration.status === 'approved'
                const isPending = registration.status === 'pending'
                const isRejected = registration.status === 'rejected'

                return (
                  <div
                    key={registration.id}
                    className={cn(
                      'p-3 rounded-lg border transition-colors',
                      isApproved && 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-800',
                      isRejected && 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-200 dark:border-rose-800',
                      isPending && 'bg-background border-border hover:bg-muted/50'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium text-sm truncate">{project.title || t('registration.unknownProject') || 'Unknown Project'}</h5>
                          <StatusBadge status={registration.status || 'pending'} />
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {project.description || t('registration.noDescription') || 'No description available'}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {project.supervisor && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{project.supervisor.name || project.supervisor.email || 'Unknown'}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{(project.currentStudents ?? 0)}/{(project.maxStudents ?? 0)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewRegistration(registration)}
                          className="h-8"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {isPending && request.status === 'pending' && onApproveProject && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => onApproveProject(request.id, project.id)}
                            disabled={isLoading}
                            className="h-8"
                          >
                            {isLoading ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <>
                                <Check className="h-3.5 w-3.5 mr-1" />
                                {t('registration.approveProject')}
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Group Details */}
          {studentGroup && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <h5 className="text-sm font-semibold mb-2">{t('registration.groupDetails') || 'Group Details'}</h5>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('registration.groupLeader') || 'Group Leader'}:</span>
                  <span className="font-medium">
                    {studentGroup.leader?.name || 
                     (typeof submitter === 'object' ? submitter?.name || submitter?.email : submitter) || 
                     'Unknown'}
                  </span>
                </div>
                {studentGroup.members && Array.isArray(studentGroup.members) && studentGroup.members.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <span className="text-muted-foreground">{t('registration.groupMembers') || 'Group Members'}:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {studentGroup.members.map((member) => (
                          <span key={member?.id || Math.random()} className="text-xs bg-muted px-2 py-1 rounded">
                            {member?.name || 'Unknown'}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Warning for approval */}
          {pendingProjects.length > 0 && request.status === 'pending' && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-900 dark:text-amber-100">
                  {t('registration.approveWillRejectOthers')}
                </p>
              </div>
            </div>
          )}

          {/* Reject Button */}
          {request.status === 'pending' && onRejectRequest && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onRejectRequest(request.id)}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('common.processing')}
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    {t('registration.rejectTitle')}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
