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
  FileEdit
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
  t: (key: string) => string
}

export function GroupedSubmissionCard({
  submission,
  onViewProposal,
  onApproveProposal,
  onRejectProposal,
  onRequestModification,
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

  return (
    <div className={cn(
      'rounded-lg border transition-all duration-200',
      getStatusColor(submission.status),
      isExpanded && 'shadow-md'
    )}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
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
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm truncate">{displayName}</h3>
                <StatusBadge status={submission.status === 'mixed' ? 'pending_review' : submission.status} />
              </div>
              
              <p className="text-xs text-muted-foreground mb-2">{description}</p>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
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
                    <User className="h-3.5 w-3.5" />
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
        <div className="border-t border-current/10 p-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">
              {t('committee.proposal.proposalsInSubmission') || 'Proposals in this submission'} ({submission.proposals.length} / {submission.totalProposals})
            </h4>
          </div>

          {submission.proposals.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              {t('committee.proposal.noProposalsInSubmission') || 'No proposals found in this submission'}
            </div>
          ) : (
            <div className="space-y-2">
              {submission.proposals.map((proposal, index) => (
              <div
                key={proposal.id}
                className={cn(
                  'p-3 rounded-lg border bg-background/50',
                  'hover:bg-background/80 transition-colors'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-1.5 rounded bg-primary/10 shrink-0 mt-0.5">
                      <FileText className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-muted-foreground">
                          #{index + 1}
                        </span>
                        <h5 className="text-sm font-medium truncate">{proposal.title}</h5>
                        <StatusBadge status={proposal.status} />
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {proposal.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(proposal.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Proposal Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewProposal(proposal)}
                      className="h-7 px-2"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    
                    {(proposal.status === 'pending_review' || proposal.status === 'requires_modification') && (
                      <>
                        {onApproveProposal && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onApproveProposal(proposal)}
                            className="h-7 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {onRequestModification && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRequestModification(proposal)}
                            className="h-7 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                          >
                            <FileEdit className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {onRejectProposal && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRejectProposal(proposal)}
                            className="h-7 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
