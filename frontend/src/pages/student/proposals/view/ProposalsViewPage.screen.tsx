import { useParams, useNavigate } from 'react-router-dom'
import { BlockContent, StatusBadge, LoadingSpinner } from '@/components/common'
import { Button } from '@/components/ui'
import {
  MessageSquare,
  RotateCcw,
  Loader2,
  User,
  Users,
  Briefcase,
  ArrowLeft,
  Eye,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  Sparkles,
  Edit
} from 'lucide-react'
import { formatDate, formatDateTime, formatRelativeTime } from '@/lib/utils/format'
import { useTranslation } from 'react-i18next'
import { useProposalsView } from './ProposalsView.hook'
import { ROUTES } from '@/lib/constants'
import { useMyGroup } from '@/pages/student/groups/hooks/useGroups'
import { useAuthStore } from '@/pages/auth/login'
import { cn } from '@/lib/utils'

export function ProposalsView() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { data: studentGroup } = useMyGroup()
  const isLeader = studentGroup ? studentGroup.leaderId === user?.id : false
  const isReadOnly = studentGroup ? !isLeader : false
  const { proposal, isLoading, handleResubmit, isResubmitting } = useProposalsView(id || '')

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!proposal) {
    return (
      <BlockContent title={t('proposal.notFound')}>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="p-4 rounded-full bg-muted/50 mb-4">
            <FileText className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <p className="text-muted-foreground mb-4">{t('proposal.proposalNotFound')}</p>
          <Button onClick={() => navigate(ROUTES.STUDENT.MY_PROPOSALS)}>
            <ArrowLeft className="h-4 w-4 me-2" />
            {t('common.back')}
          </Button>
        </div>
      </BlockContent>
    )
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          gradient: 'from-emerald-500/10 to-emerald-500/5',
          border: 'border-emerald-200 dark:border-emerald-800',
          text: 'text-emerald-700 dark:text-emerald-300',
          bg: 'bg-emerald-50 dark:bg-emerald-950/20',
        }
      case 'rejected':
        return {
          gradient: 'from-rose-500/10 to-rose-500/5',
          border: 'border-rose-200 dark:border-rose-800',
          text: 'text-rose-700 dark:text-rose-300',
          bg: 'bg-rose-50 dark:bg-rose-950/20',
        }
      case 'requires_modification':
        return {
          gradient: 'from-amber-500/10 to-amber-500/5',
          border: 'border-amber-200 dark:border-amber-800',
          text: 'text-amber-700 dark:text-amber-300',
          bg: 'bg-amber-50 dark:bg-amber-950/20',
        }
      default:
        return {
          gradient: 'from-blue-500/10 to-blue-500/5',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-700 dark:text-blue-300',
          bg: 'bg-blue-50 dark:bg-blue-950/20',
        }
    }
  }

  const statusConfig = getStatusConfig(proposal.status)

  return (
    <div className="space-y-6">
      <BlockContent
        title={proposal.title}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={proposal.status} />
            <Button variant="outline" onClick={() => navigate(ROUTES.STUDENT.MY_PROPOSALS)}>
              <ArrowLeft className="h-4 w-4 me-2" />
              {t('common.back')}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Read-only indicator for group members */}
          {isReadOnly && (
            <div className={cn(
              'flex items-center gap-3 p-4 rounded-lg border',
              'bg-gradient-to-r from-blue-50 to-blue-50/50 border-blue-200',
              'dark:from-blue-950/30 dark:to-blue-950/10 dark:border-blue-800'
            )}>
              <div className="p-2 rounded-lg bg-blue-500/10 shrink-0">
                <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {t('proposal.readOnlyView')}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  {t('proposal.submittedByGroupLeader')}: {proposal.submitter?.name}
                </p>
              </div>
            </div>
          )}

          {/* Title Field - Matching ProposalFields design */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <div className="p-1 rounded bg-primary/10">
                <FileText className="h-3.5 w-3.5 text-primary" />
              </div>
              {t('proposal.title')}
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-sm font-medium">{proposal.title}</p>
            </div>
          </div>

          {/* Description Field - Matching ProposalFields design */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <div className="p-1 rounded bg-primary/10">
                <MessageSquare className="h-3.5 w-3.5 text-primary" />
              </div>
              {t('proposal.description')}
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {proposal.description}
              </p>
            </div>
          </div>

          {/* Proposed Supervisor Field - Matching ProposalFields design */}
          {proposal.proposedSupervisor && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <div className="p-1 rounded bg-primary/10">
                  <User className="h-3.5 w-3.5 text-primary" />
                </div>
                {t('proposal.proposedSupervisor')}
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-primary">
                      {proposal.proposedSupervisor.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {proposal.proposedSupervisor.name || proposal.proposedSupervisor.email}
                    </p>
                    <p className="text-xs text-muted-foreground">{t('roles.supervisor')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Team Members Field */}
          {proposal.teamMembers && Array.isArray(proposal.teamMembers) && proposal.teamMembers.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <div className="p-1 rounded bg-primary/10">
                  <Users className="h-3.5 w-3.5 text-primary" />
                </div>
                {t('proposal.teamMembers')}
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="grid gap-2 sm:grid-cols-2">
                  {proposal.teamMembers.map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 rounded-md bg-background/50"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-medium text-primary">
                          {member.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{member.name}</p>
                        {member.role && (
                          <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Date Details Section - Comprehensive date information */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <div className="p-1 rounded bg-primary/10">
                <Calendar className="h-3.5 w-3.5 text-primary" />
              </div>
              {t('proposal.dateDetails') || 'Date Details'}
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50 space-y-4">
              {/* Submitted Date */}
              <div className="flex items-start gap-3 pb-3 border-b border-border/50">
                <div className="p-1.5 rounded-lg bg-primary/10 shrink-0">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">{t('proposal.submittedAt')}</p>
                  <p className="text-sm font-medium">{formatDateTime(proposal.createdAt)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatRelativeTime(proposal.createdAt)}
                  </p>
                </div>
              </div>

              {/* Reviewed Date */}
              {proposal.reviewedAt && (
                <div className="flex items-start gap-3 pb-3 border-b border-border/50">
                  <div className={cn(
                    'p-1.5 rounded-lg shrink-0',
                    proposal.status === 'approved' ? 'bg-emerald-500/10' :
                      proposal.status === 'rejected' ? 'bg-rose-500/10' : 'bg-amber-500/10'
                  )}>
                    <CheckCircle2 className={cn(
                      'h-4 w-4',
                      proposal.status === 'approved' ? 'text-emerald-600 dark:text-emerald-400' :
                        proposal.status === 'rejected' ? 'text-rose-600 dark:text-rose-400' :
                          'text-amber-600 dark:text-amber-400'
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">{t('proposal.reviewedAt')}</p>
                    <p className="text-sm font-medium">{formatDateTime(proposal.reviewedAt)}</p>
                    {proposal.reviewer && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('proposal.reviewedBy')}: {proposal.reviewer.name || proposal.reviewer.email}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Last Updated Date */}
              {proposal.updatedAt && proposal.updatedAt !== proposal.createdAt && (
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-muted-foreground/10 shrink-0">
                    <Edit className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">{t('common.lastUpdated')}</p>
                    <p className="text-sm font-medium">{formatDateTime(proposal.updatedAt)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatRelativeTime(proposal.updatedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Review Notes */}
          {proposal.reviewNotes && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <div className="p-1 rounded bg-primary/10">
                  <MessageSquare className="h-3.5 w-3.5 text-primary" />
                </div>
                {t('proposal.reviewNotes')}
              </div>
              <div className={cn(
                'p-4 rounded-lg border',
                statusConfig.gradient,
                statusConfig.border
              )}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {proposal.reviewNotes}
                </p>
              </div>
            </div>
          )}

          {/* Associated Project */}
          {proposal.project && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <div className="p-1 rounded bg-primary/10">
                  <Briefcase className="h-3.5 w-3.5 text-primary" />
                </div>
                {t('proposal.associatedProject')}
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Briefcase className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{proposal.project.title}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="h-3 w-3" />
                      {t('status.approved')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reviewer Information */}
          {proposal.reviewer && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <div className="p-1 rounded bg-primary/10">
                  <User className="h-3.5 w-3.5 text-primary" />
                </div>
                {t('proposal.reviewer')}
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                      {proposal.reviewer.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {proposal.reviewer.name || proposal.reviewer.email}
                    </p>
                    <p className="text-xs text-muted-foreground">{t('roles.projects_committee')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Resubmit Action */}
          {proposal.status === 'requires_modification' && !isReadOnly && (
            <div className={cn(
              'flex items-center justify-between gap-4 p-4 rounded-lg border',
              'bg-gradient-to-r from-amber-50 to-amber-50/50 border-amber-200',
              'dark:from-amber-950/30 dark:to-amber-950/10 dark:border-amber-800'
            )}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 shrink-0">
                  <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    {t('proposal.status.requiresModification')}
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    {t('proposal.resubmitMessage') || 'Make changes and resubmit for review'}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleResubmit}
                disabled={isResubmitting}
                className="gap-2 shrink-0"
              >
                {isResubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('common.processing')}
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4" />
                    {t('proposal.resubmit')}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </BlockContent>
    </div>
  )
}
