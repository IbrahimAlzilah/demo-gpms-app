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
  AlertCircle,
  AlertTriangle,
  FileEdit,
  Edit,
  Trash2,
  Mail
} from 'lucide-react'
import { formatDate, formatRelativeTime } from '@/lib/utils/format'
import { cn } from '@/lib/utils'
import type { UnifiedGroup } from '../api/registration.service'
import type { Proposal } from '@/types/project.types'
import type { GroupRegistrationRequest, ProjectRegistration } from '@/types/project.types'

interface UnifiedGroupCardProps {
  unifiedGroup: UnifiedGroup
  onViewProposal?: (proposal: Proposal) => void
  onViewRegistration?: (registration: ProjectRegistration) => void
  onApproveProposal?: ((proposal: Proposal) => void) | undefined
  onRejectProposal?: ((proposal: Proposal) => void) | undefined
  onRequestModification?: ((proposal: Proposal) => void) | undefined
  onApproveProject?: (requestId: string, projectId: string) => void
  onRejectRequest?: (requestId: string) => void
  onEditProposal?: ((proposal: Proposal) => void) | undefined
  onDeleteProposal?: ((proposal: Proposal) => void) | undefined
  isLoadingAction?: (id: string, type: 'proposal' | 'registration') => boolean
}

export function UnifiedGroupCard({
  unifiedGroup,
  onViewProposal,
  onViewRegistration,
  onApproveProposal,
  onRejectProposal,
  onRequestModification,
  onApproveProject,
  onRejectRequest,
  onEditProposal,
  onDeleteProposal,
  isLoadingAction,
}: UnifiedGroupCardProps) {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedSection, setExpandedSection] = useState<'proposals' | 'registrations' | null>(null)

  const {
    group,
    proposals = [],
    registrationRequests = [],
    approvedProject,
    hasPendingProposals,
    hasPendingRegistrations,
    canApproveNewProject,
  } = unifiedGroup

  // Warning: Group already has approved project
  const hasApprovedProjectWarning = !canApproveNewProject && approvedProject

  return (
    <div className={cn(
      'rounded-lg border transition-all duration-200',
      hasApprovedProjectWarning && 'border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/10',
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
                  {group?.name || group?.groupCode || `Group ${group?.id || 'N/A'}`}
                </h3>
                {hasApprovedProjectWarning && (
                  <StatusBadge status="approved" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" />
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                {proposals.length > 0 && registrationRequests.length > 0
                  ? `${proposals.length} ${t('common.proposals')}, ${registrationRequests.length} ${t('registration.requests')}`
                  : proposals.length > 0
                    ? `${proposals.length} ${t('common.proposals')}`
                    : `${registrationRequests.length} ${t('registration.requests')}`
                }
              </p>

              {/* Warning Banner */}
              {hasApprovedProjectWarning && (
                <div className="mb-2 p-2 bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-md">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-900 dark:text-amber-100">
                      {t('registration.groupHasApprovedProject', {
                        project: approvedProject?.title || t('common.project'),
                        defaultValue: `This group already has an approved project: ${approvedProject?.title || 'N/A'}. Only one project can be approved per group.`
                      })}
                    </p>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
                {proposals.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    <span className="font-medium">
                      {proposals.length} {proposals.length === 1 ? t('proposal.proposal') : t('common.proposals')}
                    </span>
                  </div>
                )}

                {registrationRequests.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    <span className="font-medium">
                      {registrationRequests.length} {registrationRequests.length === 1 ? t('registration.request') : t('registration.requests')}
                    </span>
                  </div>
                )}

                {group && (
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    <span>
                      {group.memberCount || group.members?.length || 0} {t('common.members')}
                    </span>
                  </div>
                )}

                {group?.leader && (
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[150px]">
                      {group.leader.name || group.leader.email || 'Unknown'}
                    </span>
                  </div>
                )}

                {approvedProject && (
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                      {t('registration.approvedProject')}: {approvedProject.title}
                    </span>
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

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-border/50 bg-background/30 dark:bg-background/10 p-4 sm:p-5 space-y-4">
          {/* Proposals Section */}
          {proposals.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">
                  {t('common.proposals')} ({proposals.length})
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedSection(expandedSection === 'proposals' ? null : 'proposals')}
                  className="h-7"
                >
                  {expandedSection === 'proposals' ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>

              {expandedSection === 'proposals' && (
                <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                  {proposals.map((proposal) => {
                    const isLoading = isLoadingAction?.(proposal.id, 'proposal') || false
                    const canReview = proposal.status === 'pending_review' || proposal.status === 'requires_modification'
                    const isApproved = proposal.status === 'approved'

                    return (
                      <div
                        key={proposal.id}
                        className={cn(
                          'p-3 rounded-lg border bg-background',
                          isApproved && 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-800',
                          proposal.status === 'rejected' && 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-200 dark:border-rose-800',
                          proposal.status === 'requires_modification' && 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-800',
                          isLoading && 'opacity-60'
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium text-sm truncate">{proposal.title}</h5>
                              <StatusBadge status={proposal.status} />
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                              {proposal.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{formatRelativeTime(proposal.createdAt)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {onViewProposal && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onViewProposal(proposal)}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {canReview && !hasApprovedProjectWarning && onApproveProposal && onRejectProposal && onRequestModification && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onApproveProposal(proposal)}
                                  disabled={isLoading}
                                  className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                >
                                  {isLoading ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Check className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onRequestModification(proposal)}
                                  disabled={isLoading}
                                  className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                >
                                  <FileEdit className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onRejectProposal(proposal)}
                                  disabled={isLoading}
                                  className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                            {hasApprovedProjectWarning && canReview && (
                              <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                                <AlertCircle className="h-3.5 w-3.5" />
                                <span>{t('registration.cannotApproveAnother')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Registration Requests Section */}
          {registrationRequests.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">
                  {t('registration.registrationRequests')} ({registrationRequests.length})
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedSection(expandedSection === 'registrations' ? null : 'registrations')}
                  className="h-7"
                >
                  {expandedSection === 'registrations' ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>

              {expandedSection === 'registrations' && (
                <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                  {registrationRequests.map((request) => {
                    const projectRegistrations = request.projectRegistrations || []
                    const isLoading = isLoadingAction?.(request.id, 'registration') || false

                    return (
                      <div
                        key={request.id}
                        className={cn(
                          'p-3 rounded-lg border bg-background',
                          request.status === 'approved' && 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-800',
                          request.status === 'rejected' && 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-200 dark:border-rose-800'
                        )}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <StatusBadge status={request.status || 'pending'} />
                              <span className="text-xs text-muted-foreground">
                                {projectRegistrations.length} {t('registration.projects')}
                              </span>
                            </div>
                            {request.submittedAt && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{formatRelativeTime(request.submittedAt)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Projects in this request */}
                        {projectRegistrations.length > 0 && (
                          <div className="mt-2 space-y-1.5">
                            {projectRegistrations.map((registration) => {
                              const project = registration?.project
                              if (!project) return null

                              const isPending = registration.status === 'pending'

                              return (
                                <div
                                  key={registration.id}
                                  className={cn(
                                    'p-2 rounded border text-xs',
                                    registration.status === 'approved' && 'bg-emerald-50/30 dark:bg-emerald-950/5 border-emerald-200/50',
                                    registration.status === 'rejected' && 'bg-rose-50/30 dark:bg-rose-950/5 border-rose-200/50',
                                    isPending && 'bg-background border-border'
                                  )}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium truncate">{project.title}</p>
                                      <StatusBadge status={registration.status || 'pending'} className="mt-1" />
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      {onViewRegistration && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => onViewRegistration(registration)}
                                          className="h-7 w-7 p-0"
                                        >
                                          <Eye className="h-3 w-3" />
                                        </Button>
                                      )}
                                      {isPending && request.status === 'pending' && onApproveProject && !hasApprovedProjectWarning && (
                                        <Button
                                          variant="default"
                                          size="sm"
                                          onClick={() => onApproveProject(request.id, project.id)}
                                          disabled={isLoading}
                                          className="h-7 px-2"
                                        >
                                          {isLoading ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                          ) : (
                                            <>
                                              <Check className="h-3 w-3 mr-1" />
                                              {t('registration.approveProject')}
                                            </>
                                          )}
                                        </Button>
                                      )}
                                      {hasApprovedProjectWarning && isPending && (
                                        <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                                          <AlertCircle className="h-3 w-3" />
                                          <span>{t('registration.cannotApproveAnother')}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {/* Reject Button */}
                        {request.status === 'pending' && onRejectRequest && (
                          <div className="mt-2 pt-2 border-t border-border/50">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => onRejectRequest(request.id)}
                              disabled={isLoading}
                              className="w-full h-7"
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                  {t('common.processing')}
                                </>
                              ) : (
                                <>
                                  <X className="h-3 w-3 mr-2" />
                                  {t('registration.rejectTitle')}
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Group Details */}
          {group && (
            <div className="pt-4 border-t border-border/50">
              <h5 className="text-sm font-semibold mb-2">{t('registration.groupDetails') || 'Group Details'}</h5>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('registration.groupLeader') || 'Group Leader'}:</span>
                  <span className="font-medium">
                    {group.leader?.name || group.leader?.email || 'Unknown'}
                  </span>
                </div>
                {group.members && Array.isArray(group.members) && group.members.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <span className="text-muted-foreground">{t('registration.groupMembers') || 'Group Members'}:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {group.members.map((member) => (
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
        </div>
      )}
    </div>
  )
}
