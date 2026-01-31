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
  Edit,
  Trash2,
  Loader2,
  Mail,
  CheckCircle2,
  Building2
} from 'lucide-react'
import { formatDate, formatRelativeTime } from '@/lib/utils/format'
import { cn } from '@/lib/utils'
import type { Submission, StudentGroupSubmission, SupervisorSubmission, CommitteeSubmission } from '../types/GroupedSubmissions.types'
import type { Proposal } from '@/types/project.types'
import { getSubmissionDisplayName, getSubmissionDescription } from '../utils/groupProposals'

interface GroupedSubmissionCardProps {
  submission: Submission
  onViewProposal: (proposal: Proposal) => void
  onApproveProposal?: (proposal: Proposal) => void
  onRejectProposal?: (proposal: Proposal) => void
  onRequestModification?: (proposal: Proposal) => void
  onEditProposal?: (proposal: Proposal) => void
  onDeleteProposal?: (proposal: Proposal) => void
  isLoadingAction?: (proposalId: string) => boolean
  t: (key: string) => string
}

export function GroupedSubmissionCard({
  submission,
  onViewProposal,
  onApproveProposal,
  onRejectProposal,
  onRequestModification,
  onEditProposal,
  onDeleteProposal,
  isLoadingAction,
  t,
}: GroupedSubmissionCardProps) {
  const { t: translate } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)

  const displayName = getSubmissionDisplayName(submission, translate)
  const description = getSubmissionDescription(submission, translate)
  const isStudentGroup = submission.origin === 'student_group'
  const isCommittee = submission.origin === 'committee'
  const studentGroupSubmission = submission as StudentGroupSubmission
  const supervisorSubmission = submission as SupervisorSubmission
  const committeeSubmission = submission as CommitteeSubmission

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
                : isCommittee
                  ? 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                  : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
            )}>
              {isStudentGroup ? (
                <Users className="h-5 w-5" />
              ) : isCommittee ? (
                <Building2 className="h-5 w-5" />
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
                      {count} {translate(`proposal.status.${status}`, { defaultValue: status })}
                    </span>
                  ))}
                </div>
              )}

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  <span className="font-medium">
                    {translate('committee.proposal.submissionDescriptionProposals', {
                      count: submission.totalProposals,
                      defaultValue:
                        submission.totalProposals === 1
                          ? '1 proposal'
                          : `${submission.totalProposals} proposals`,
                    })}
                  </span>
                </div>

                {isStudentGroup && studentGroupSubmission.studentGroup && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      <span>
                        {studentGroupSubmission.studentGroup.memberCount ||
                          studentGroupSubmission.studentGroup.members?.length || 0} {t('common.members')}
                      </span>
                    </div>
                    {studentGroupSubmission.studentGroup.leader && (
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        <span className="truncate max-w-[150px]">
                          {t('proposal.leader') || 'Leader'}: {studentGroupSubmission.studentGroup.leader.name || 'Unknown'}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {isStudentGroup && studentGroupSubmission.submitter && (
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[150px]">
                      {t('proposal.submittedBy')}: {studentGroupSubmission.submitter.name || studentGroupSubmission.submitter.email || 'Unknown'}
                    </span>
                  </div>
                )}

                {isCommittee && committeeSubmission.submitter && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[150px]">
                      {translate('committee.proposal.addedBy', { defaultValue: 'Added by' })}: {committeeSubmission.submitter.name || committeeSubmission.submitter.email || 'Unknown'}
                    </span>
                  </div>
                )}

                {!isStudentGroup && !isCommittee && supervisorSubmission.supervisor && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[150px]">
                      {supervisorSubmission.supervisor.name || supervisorSubmission.supervisor.email || 'Unknown'}
                    </span>
                    {supervisorSubmission.supervisor.department && (
                      <span className="text-muted-foreground/70">
                        • {supervisorSubmission.supervisor.department}
                      </span>
                    )}
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-semibold mb-1">
                {t('committee.proposal.proposalsInSubmission') || 'Proposals in this submission'}
              </h4>
              <p className="text-xs text-muted-foreground">
                {t('committee.proposal.allProposalsVisible') || 'All proposals are listed below. Each proposal can be reviewed independently.'}
              </p>
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              {submission.proposals.length} / {submission.totalProposals}
            </div>
          </div>

          {submission.proposals.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>{t('committee.proposal.noProposalsInSubmission') || 'No proposals found in this submission'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {submission.proposals.map((proposal, index) => {
                const isLoading = isLoadingAction?.(proposal.id) || false
                const canReview = proposal.status === 'pending_review' || proposal.status === 'requires_modification'
                return (
                  <div
                    key={proposal.id}
                    className={cn(
                      'p-4 rounded-lg border bg-background',
                      'hover:bg-muted/50 transition-all duration-200',
                      'hover:shadow-md hover:border-primary/20',
                      isLoading && 'opacity-60 pointer-events-none',
                      !canReview && 'opacity-90'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={cn(
                          'p-2.5 rounded-lg shrink-0 mt-0.5',
                          'border-2',
                          proposal.status === 'approved' && 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800',
                          proposal.status === 'rejected' && 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800',
                          proposal.status === 'requires_modification' && 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800',
                          proposal.status === 'pending_review' && 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                        )}>
                          <FileText className={cn(
                            'h-4 w-4',
                            proposal.status === 'approved' && 'text-emerald-600 dark:text-emerald-400',
                            proposal.status === 'rejected' && 'text-rose-600 dark:text-rose-400',
                            proposal.status === 'requires_modification' && 'text-amber-600 dark:text-amber-400',
                            proposal.status === 'pending_review' && 'text-blue-600 dark:text-blue-400'
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-2 flex-wrap">
                            <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-md border">
                              #{index + 1}
                            </span>
                            <h5 className="text-base font-semibold flex-1 min-w-[200px]">{proposal.title}</h5>
                            <StatusBadge status={proposal.status} />
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 leading-relaxed line-clamp-3">
                            {proposal.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3 w-3" />
                              <span className="font-medium">{t('proposal.submittedAt')}:</span>
                              <span>{formatDate(proposal.createdAt)}</span>
                            </div>
                            {proposal.reviewedAt && (
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3 w-3" />
                                <span className="font-medium">{t('proposal.reviewedAt')}:</span>
                                <span>{formatDate(proposal.reviewedAt)}</span>
                              </div>
                            )}
                            {proposal.reviewer && (
                              <div className="flex items-center gap-1.5">
                                <User className="h-3 w-3" />
                                <span className="font-medium">{t('proposal.reviewer')}:</span>
                                <span>{proposal.reviewer.name || proposal.reviewer.email || 'Unknown'}</span>
                              </div>
                            )}
                          </div>
                          {proposal.reviewNotes && (
                            <div className="mt-3 p-2.5 rounded-md bg-muted/50 border border-border/50">
                              <p className="text-xs font-medium text-muted-foreground mb-1">{t('proposal.reviewNotes')}:</p>
                              <p className="text-xs text-muted-foreground line-clamp-2">{proposal.reviewNotes}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Proposal Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {isLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onViewProposal(proposal)}
                              className="h-9 px-3 hover:bg-primary/10"
                              title={t('common.view')}
                            >
                              <Eye className="size-4" />
                            </Button>

                            {canReview && (
                              <div className="flex items-center gap-1 border-l border-border/50 ps-1">
                                {onApproveProposal && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onApproveProposal(proposal)}
                                    className="h-9 px-3 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                                    title={t('committee.proposal.approve')}
                                  >
                                    <Check className="size-4" />
                                  </Button>
                                )}
                                {onRequestModification && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onRequestModification(proposal)}
                                    className="h-9 px-3 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                                    title={t('committee.proposal.requestModification')}
                                  >
                                    <FileEdit className="size-4" />
                                  </Button>
                                )}
                                {onRejectProposal && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onRejectProposal(proposal)}
                                    className="h-9 px-3 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                                    title={t('committee.proposal.reject')}
                                  >
                                    <X className="size-4" />
                                  </Button>
                                )}
                              </div>
                            )}

                            {/* Edit and Delete buttons - always visible for Projects Committee */}
                            <div className="flex items-center gap-1 border-l border-border/50 ps-1">
                              {onEditProposal && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onEditProposal(proposal)}
                                  className="h-9 px-3 hover:bg-primary/10"
                                  title={t('common.edit')}
                                >
                                  <Edit className="size-4" />
                                </Button>
                              )}
                              {onDeleteProposal && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onDeleteProposal(proposal)}
                                  className="h-9 px-3 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                                  title={t('common.delete')}
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              )}
                            </div>
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
