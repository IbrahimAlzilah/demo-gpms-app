import { useParams, useNavigate } from 'react-router-dom'
import { BlockContent, StatusBadge, LoadingSpinner } from '@/components/common'
import { Button } from '@/components/ui'
import { MessageSquare, RotateCcw, Loader2, User, Users, Briefcase, ArrowLeft, AlertCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'
import { useTranslation } from 'react-i18next'
import { useProposalsView } from './ProposalsView.hook'
import { ROUTES } from '@/lib/constants'
import { useMyGroup } from '@/pages/student/groups/hooks/useGroups'
import { useAuthStore } from '@/pages/auth/login'

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
        <p className="text-muted-foreground">{t('proposal.proposalNotFound')}</p>
        <Button onClick={() => navigate(ROUTES.STUDENT.MY_PROPOSALS)} className="mt-4">
          {t('common.back')}
        </Button>
      </BlockContent>
    )
  }

  return (
    <BlockContent
      title={proposal.title || ''}
      actions={
        <Button variant="outline" onClick={() => navigate(ROUTES.STUDENT.MY_PROPOSALS)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back')}
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Read-only indicator for group members */}
        {isReadOnly && (
          <div className="flex items-center gap-3 p-3 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              {t('proposal.readOnlyView')}
            </p>
          </div>
        )}

        <div className="flex items-center gap-4 text-sm">
          <StatusBadge status={proposal.status} />
          {proposal.createdAt && (
            <span className="text-muted-foreground">
              {t('proposal.submittedAt')} {formatDate(proposal.createdAt)}
            </span>
          )}
        </div>

        {/* Show "Submitted by Group Leader" for group members */}
        {isReadOnly && proposal.submitter && (
          <div className="text-sm text-muted-foreground">
            {t('proposal.submittedByGroupLeader')}: {proposal.submitter.name}
          </div>
        )}

        {proposal.description && (
          <div>
            <h4 className="text-sm font-medium mb-2">{t('proposal.description')}</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {proposal.description}
            </p>
          </div>
        )}

        {proposal.proposedSupervisor && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">{t('proposal.proposedSupervisor')}</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              {proposal.proposedSupervisor.name || proposal.proposedSupervisor.email}
            </p>
          </div>
        )}

        {proposal.teamMembers && Array.isArray(proposal.teamMembers) && proposal.teamMembers.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">{t('proposal.teamMembers')}</h4>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              {proposal.teamMembers.map((member, index) => (
                <li key={index}>
                  {member.name} {member.role && `- ${member.role}`}
                </li>
              ))}
            </ul>
          </div>
        )}

        {proposal.project && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">{t('proposal.linkedProject')}</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              {proposal.project.title}
            </p>
          </div>
        )}

        {proposal.submitter && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">{t('proposal.submitter')}</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              {proposal.submitter.name || proposal.submitter.email}
            </p>
          </div>
        )}

        {proposal.reviewer && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">{t('proposal.reviewer')}</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              {proposal.reviewer.name || proposal.reviewer.email}
            </p>
          </div>
        )}

        {proposal.reviewNotes && (
          <div className="rounded-lg bg-muted p-4 border border-muted-foreground/20">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">{t('proposal.reviewNotes')}</h4>
            </div>
            <p className="text-sm whitespace-pre-wrap">{proposal.reviewNotes}</p>
            {proposal.reviewedAt && (
              <p className="text-xs text-muted-foreground mt-2">
                {t('proposal.reviewedAt')} {formatDate(proposal.reviewedAt)}
              </p>
            )}
          </div>
        )}

        {proposal.updatedAt && proposal.updatedAt !== proposal.createdAt && (
          <div className="text-xs text-muted-foreground">
            {t('common.lastUpdated')} {formatDate(proposal.updatedAt)}
          </div>
        )}

        {/* Only show resubmit button for group leaders */}
        {proposal.status === 'requires_modification' && !isReadOnly && (
          <div className="pt-4 border-t">
            <Button
              onClick={handleResubmit}
              className="w-full"
              disabled={isResubmitting}
            >
              {isResubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common.processing')}
                </>
              ) : (
                <>
                  <RotateCcw className="size-4" />
                  {t('proposal.resubmit')}
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </BlockContent>
  )
}
