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
  FileEdit,
  Loader2,
  Mail
} from 'lucide-react'
import { formatDate, formatRelativeTime } from '@/lib/utils/format'
import { cn } from '@/lib/utils'
import type { Submission, StudentGroupSubmission, SupervisorSubmission } from '../types/GroupedSubmissions.types'
import type { Proposal } from '@/types/project.types'
import { getSubmissionDisplayName, getSubmissionDescription } from '../utils/groupProposals'

interface GroupedSubmissionCardProps {
  submission: Submission
  onViewProposal: (proposal: Proposal) => void
  onApproveProposal?: (proposal: Proposal) => void
  onRejectProposal?: (proposal: Proposal) => void
  onRequestModification?: (proposal: Proposal) => void
  isLoadingAction?: (proposalId: string) => boolean
  t: (key: string) => string
}

export function GroupedSubmissionCard({
  submission,
  onViewProposal,
  onApproveProposal,
  onRejectProposal,
  onRequestModification,
  isLoadingAction,
  t,
}: GroupedSubmissionCardProps) {
  const { t: translate } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)

  const displayName = getSubmissionDisplayName(submission)
  const description = getSubmissionDescription(submission)
  const isStudentGroup = submission.origin === 'student_group'
  const studentGroupSubmission = submission as StudentGroupSubmission
  const supervisorSubmission = submission as SupervisorSubmission

  const getStatusColor = (status: Submission['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
      case 'rejected':
        return 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800'
      case 'requires_modification':
        return 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
      case 'mixed':
        return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
      default:
        return 'bg-muted/50 border-border'
    }
  }

  // Count proposals by status
  const statusCounts = submission.proposals.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className={cn(
      'rounded-lg border transition-all duration-200',
      getStatusColor(submission.status),
      isExpanded && 'shadow-md'
    )}>
      {/* Header */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
            {/* Icon */}
            <div className={cn(
              'p-2 rounded-lg shrink-0',
              isStudentGroup 
                ? 'bg-primary/10 text-primary' 
                : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
            )}>
              {isStudentGroup ? (
                <Users className="h-5 w-5" />
              ) : (
                <User className="h-5 w-5" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="font-semibold text-base truncate">{displayName}</h3>
                <StatusBadge status={submission.status === 'mixed' ? 'pending_review' : submission.status} />
              </div>
              
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{description}</p>
              
              {/* Status Summary */}
              {submission.status === 'mixed' && (
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <span
                      key={status}
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-full font-medium',
                        status === 'approved' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
                        status === 'rejected' && 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
                        status === 'requires_modification' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
                        status === 'pending_review' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      )}
                    >
                      {count} {t(`proposal.status.${status}`) || status}
                    </span>
                  ))}
                </div>
              )}

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  <span className="font-medium">
                    {submission.totalProposals} {submission.totalProposals === 1 ? t('proposal.proposal') : t('proposal.proposals')}
                  </span>
                </div>
                
                {isStudentGroup && studentGroupSubmission.studentGroup && (
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    <span>
                      {studentGroupSubmission.studentGroup.memberCount || 
                       studentGroupSubmission.studentGroup.members?.length || 0} {t('common.members')}
                    </span>
                  </div>
                )}
                
                {isStudentGroup && studentGroupSubmission.submitter && (
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    <span className="truncate">
                      {t('proposal.submittedBy')}: {studentGroupSubmission.submitter.name || studentGroupSubmission.submitter.email || 'Unknown'}
                    </span>
                  </div>
                )}

                {!isStudentGroup && supervisorSubmission.supervisor && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">
                      {supervisorSubmission.supervisor.name || supervisorSubmission.supervisor.email || 'Unknown'}
                    </span>
                  </div>
                )}

                {isStudentGroup && !studentGroupSubmission.studentGroup && studentGroupSubmission.studentGroupId && (
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    <span>
                      {t('committee.proposal.groupId') || 'Group'}: {studentGroupSubmission.studentGroupId}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatRelativeTime(submission.submittedAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Expand/Collapse Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="shrink-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Expanded Content - Proposals List */}
      {isExpanded && (
        <div className="border-t border-border/50 bg-background/30 dark:bg-background/10 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold">
              {t('committee.proposal.proposalsInSubmission') || 'Proposals in this submission'} 
              <span className="text-muted-foreground font-normal ms-1">
                ({submission.proposals.length} / {submission.totalProposals})
              </span>
            </h4>
          </div>

          {submission.proposals.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              {t('committee.proposal.noProposalsInSubmission') || 'No proposals found in this submission'}
            </div>
          ) : (
            <div className="space-y-2">
              {submission.proposals.map((proposal, index) => {
                const isLoading = isLoadingAction?.(proposal.id) || false
                return (
                <div
                  key={proposal.id}
                  className={cn(
                    'p-3 sm:p-4 rounded-lg border bg-background',
                    'hover:bg-muted/50 transition-all duration-200',
                    'hover:shadow-sm',
                    isLoading && 'opacity-60 pointer-events-none'
                  )}
                >
                  <div className="flex items-start justify-between gap-2 sm:gap-3">
                    <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className={cn(
                        'p-2 rounded-lg bg-primary/10 shrink-0 mt-0.5',
                        'border border-primary/20'
                      )}>
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-xs font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            #{index + 1}
                          </span>
                          <h5 className="text-sm font-semibold truncate flex-1 min-w-[200px]">{proposal.title}</h5>
                          <StatusBadge status={proposal.status} />
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2.5 leading-relaxed">
                          {proposal.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(proposal.createdAt)}</span>
                          </div>
                          {proposal.reviewedAt && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-muted-foreground/70">
                                {t('proposal.reviewedAt')}: {formatDate(proposal.reviewedAt)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Proposal Actions */}
                    <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewProposal(proposal)}
                            className="h-8 px-2.5 hover:bg-primary/10"
                            title={t('common.view')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {(proposal.status === 'pending_review' || proposal.status === 'requires_modification') && (
                            <>
                              {onApproveProposal && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onApproveProposal(proposal)}
                                  className="h-8 px-2.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                                  title={t('committee.proposal.approve')}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              {onRequestModification && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onRequestModification(proposal)}
                                  className="h-8 px-2.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                                  title={t('committee.proposal.requestModification')}
                                >
                                  <FileEdit className="h-4 w-4" />
                                </Button>
                              )}
                              {onRejectProposal && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onRejectProposal(proposal)}
                                  className="h-8 px-2.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                                  title={t('committee.proposal.reject')}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          )}
                        </>
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
    </div>
  )
}
