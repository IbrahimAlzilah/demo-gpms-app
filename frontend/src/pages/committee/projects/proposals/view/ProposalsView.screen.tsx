import { ModalDialog, StatusBadge } from '@/components/common'
import { MessageSquare, User, Users, Briefcase, Calendar, Building2, CheckCircle2, FileText } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'
import { useTranslation } from 'react-i18next'
import { useProposalsView } from './ProposalsView.hook'

interface ProposalsViewProps {
  proposalId: string | null
  open: boolean
  onClose: () => void
}

export function ProposalsView({
  proposalId,
  open,
  onClose,
}: ProposalsViewProps) {
  const { t } = useTranslation()
  const { proposal, isLoading } = useProposalsView(proposalId || '')

  if (!open || !proposalId || isLoading || !proposal) {
    return null
  }

  return (
    <ModalDialog
      open={open}
      onOpenChange={onClose}
      title={proposal.title || ''}
      size="xl"
    >
      <div className="space-y-4">
        {/* Status and Dates */}
        <div className="flex items-center gap-4 text-sm pb-4 border-b">
          <StatusBadge status={proposal.status} />
          {proposal.createdAt && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{t('proposal.submittedAt')} {formatDate(proposal.createdAt)}</span>
            </div>
          )}
          {proposal.updatedAt && proposal.updatedAt !== proposal.createdAt && (
            <span className="text-xs text-muted-foreground">
              {t('common.lastUpdated')}: {formatDate(proposal.updatedAt)}
            </span>
          )}
        </div>

        {/* Proposal Description */}
        {proposal.description && (
          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold">{t('proposal.description')}</h4>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {proposal.description}
            </p>
          </div>
        )}

        {/* Proposal Requirements */}
        {proposal.requirements && (
          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold">{t('proposal.requirements') || 'Requirements'}</h4>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {proposal.requirements}
            </p>
          </div>
        )}

        {/* Proposed Supervisor */}
        {proposal.proposedSupervisor && (
          <div className="p-4 rounded-lg bg-muted border border-muted-foreground/20">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold">{t('proposal.proposedSupervisor')}</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">{proposal.proposedSupervisor.name}</span>
              </div>
              {proposal.proposedSupervisor.email && (
                <div className="text-muted-foreground">
                  <span className="font-medium">{t('common.email')}: </span>
                  {proposal.proposedSupervisor.email}
                </div>
              )}
              {proposal.proposedSupervisor.empId && (
                <div className="text-muted-foreground">
                  <span className="font-medium">{t('common.employeeId')}: </span>
                  {proposal.proposedSupervisor.empId}
                </div>
              )}
              {proposal.proposedSupervisor.department && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-3 w-3" />
                  <span>
                    <span className="font-medium">{t('common.department')}: </span>
                    {proposal.proposedSupervisor.department}
                  </span>
                </div>
              )}
              {proposal.proposedSupervisor.phone && (
                <div className="text-muted-foreground">
                  <span className="font-medium">{t('common.phone')}: </span>
                  {proposal.proposedSupervisor.phone}
                </div>
              )}
              <div className="text-muted-foreground">
                <span className="font-medium">{t('common.role')}: </span>
                {t(`roles.${proposal.proposedSupervisor.role}`) || proposal.proposedSupervisor.role}
              </div>
            </div>
          </div>
        )}

        {/* Team Members */}
        {proposal.teamMembers && Array.isArray(proposal.teamMembers) && proposal.teamMembers.length > 0 && (
          <div className="p-4 rounded-lg bg-muted border border-muted-foreground/20">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold">{t('proposal.teamMembers')}</h4>
            </div>
            <ul className="space-y-2 text-sm">
              {proposal.teamMembers.map((member, index) => (
                <li key={index} className="text-muted-foreground">
                  <span className="font-medium">{member.name}</span>
                  {member.role && <span className="ml-2">- {member.role}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Project Information (if linked) */}
        {proposal.project && (
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold">{t('proposal.linkedProject')}</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">{proposal.project.title}</span>
              </div>
              {proposal.project.description && (
                <div className="text-muted-foreground">
                  {proposal.project.description}
                </div>
              )}
              <div className="flex items-center gap-2">
                <StatusBadge status={proposal.project.status} />
              </div>
            </div>
          </div>
        )}

        {/* Submitter Information */}
        {proposal.submitter && (
          <div className="p-4 rounded-lg bg-muted border border-muted-foreground/20">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold">{t('proposal.submitter')}</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">{proposal.submitter.name}</span>
              </div>
              {proposal.submitter.email && (
                <div className="text-muted-foreground">
                  <span className="font-medium">{t('common.email')}: </span>
                  {proposal.submitter.email}
                </div>
              )}
              {proposal.submitter.empId && (
                <div className="text-muted-foreground">
                  <span className="font-medium">{t('common.employeeId')}: </span>
                  {proposal.submitter.empId}
                </div>
              )}
              {proposal.submitter.studentId && (
                <div className="text-muted-foreground">
                  <span className="font-medium">{t('common.studentId')}: </span>
                  {proposal.submitter.studentId}
                </div>
              )}
              {proposal.submitter.department && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-3 w-3" />
                  <span>
                    <span className="font-medium">{t('common.department')}: </span>
                    {proposal.submitter.department}
                  </span>
                </div>
              )}
              {proposal.submitter.phone && (
                <div className="text-muted-foreground">
                  <span className="font-medium">{t('common.phone')}: </span>
                  {proposal.submitter.phone}
                </div>
              )}
              <div className="text-muted-foreground">
                <span className="font-medium">{t('common.role')}: </span>
                {t(`roles.${proposal.submitter.role}`) || proposal.submitter.role}
              </div>
            </div>
          </div>
        )}

        {/* Review Information */}
        {(proposal.reviewNotes || proposal.reviewedAt || proposal.reviewer || proposal.reviewedBy) && (
          <div className="p-4 rounded-lg bg-muted border border-muted-foreground/20">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold">{t('proposal.reviewInformation')}</h4>
            </div>

            {proposal.reviewer && (
              <div className="mb-3 pb-3 border-b border-muted-foreground/20">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    {t('proposal.reviewer')}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">{proposal.reviewer.name}</span>
                  {proposal.reviewer.email && (
                    <span className="text-muted-foreground ml-2">({proposal.reviewer.email})</span>
                  )}
                </div>
              </div>
            )}

            {proposal.reviewNotes && (
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <h5 className="text-sm font-medium">{t('proposal.reviewNotes')}</h5>
                </div>
                <p className="text-sm whitespace-pre-wrap bg-background p-3 rounded border border-border">
                  {proposal.reviewNotes}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              {proposal.reviewedAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {t('proposal.reviewedAt')}: {formatDate(proposal.reviewedAt)}
                  </span>
                </div>
              )}
              {proposal.reviewedBy && !proposal.reviewer && (
                <div>
                  <span>{t('proposal.reviewedBy')}: {proposal.reviewedBy}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ModalDialog>
  )
}
