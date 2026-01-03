import { ModalDialog, StatusBadge, LoadingSpinner } from '@/components/common'
import { MessageSquare, User, Building2, Calendar, FileText, Target, FlaskConical, TrendingUp, CheckCircle2 } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'
import { useTranslation } from 'react-i18next'
import { useProposal } from '../hooks/useProposals'

interface ProposalDetailsViewProps {
  proposalId: string | null
  open: boolean
  onClose: () => void
}

export function ProposalDetailsView({
  proposalId,
  open,
  onClose,
}: ProposalDetailsViewProps) {
  const { t } = useTranslation()
  const { data: proposal, isLoading } = useProposal(proposalId || '')

  if (!open || !proposalId) {
    return null
  }

  if (isLoading) {
    return (
      <ModalDialog
        open={open}
        onOpenChange={onClose}
        title={t('committee.proposal.viewDetails') || 'تفاصيل المقترح'}
      >
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner />
        </div>
      </ModalDialog>
    )
  }

  if (!proposal) {
    return null
  }

  return (
    <ModalDialog
      open={open}
      onOpenChange={onClose}
      title={proposal.title}
      size="xl"
    >
      <div className="max-w-4xl max-h-[90vh] overflow-y-auto space-y-4">
        {/* Status and Dates */}
        <div className="flex items-center gap-4 text-sm pb-4 border-b">
          <StatusBadge status={proposal.status} />
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{t('proposal.submittedAt')} {formatDate(proposal.createdAt)}</span>
          </div>
          {proposal.updatedAt && proposal.updatedAt !== proposal.createdAt && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-xs">
                {t('common.updatedAt') || 'آخر تحديث'}: {formatDate(proposal.updatedAt)}
              </span>
            </div>
          )}
        </div>

        {/* Submitter Information */}
        {proposal.submitter && (
          <div className="p-4 rounded-lg bg-muted border border-muted-foreground/20">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold">{t('proposal.submitter') || 'معلومات المقدم'}</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">{proposal.submitter.name}</span>
              </div>
              {proposal.submitter.email && (
                <div className="text-muted-foreground">
                  <span className="font-medium">{t('common.email') || 'البريد الإلكتروني'}: </span>
                  {proposal.submitter.email}
                </div>
              )}
              {(proposal.submitter as any).empId && (
                <div className="text-muted-foreground">
                  <span className="font-medium">{t('common.employeeId') || 'رقم الموظف'}: </span>
                  {(proposal.submitter as any).empId}
                </div>
              )}
              {proposal.submitter.department && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-3 w-3" />
                  <span>
                    <span className="font-medium">{t('common.department') || 'القسم'}: </span>
                    {proposal.submitter.department}
                  </span>
                </div>
              )}
              {proposal.submitter.phone && (
                <div className="text-muted-foreground">
                  <span className="font-medium">{t('common.phone') || 'الهاتف'}: </span>
                  {proposal.submitter.phone}
                </div>
              )}
              <div className="text-muted-foreground">
                <span className="font-medium">{t('common.role') || 'الدور'}: </span>
                {t(`roles.${proposal.submitter.role}`) || proposal.submitter.role}
              </div>
            </div>
          </div>
        )}

        {/* Project Information (if linked) */}
        {proposal.project && (
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold">{t('proposal.linkedProject') || 'المشروع المرتبط'}</h4>
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

        {/* Proposal Description */}
        <div className="p-4 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-semibold">{t('proposal.description') || 'الوصف'}</h4>
          </div>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {proposal.description}
          </p>
        </div>

        {/* Objectives */}
        {proposal.objectives && (
          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold">{t('proposal.objectives') || 'الأهداف'}</h4>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {proposal.objectives}
            </p>
          </div>
        )}

        {/* Methodology */}
        {proposal.methodology && (
          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-3">
              <FlaskConical className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold">{t('proposal.methodology') || 'المنهجية'}</h4>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {proposal.methodology}
            </p>
          </div>
        )}

        {/* Expected Outcomes */}
        {proposal.expectedOutcomes && (
          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold">
                {t('proposal.expectedOutcomes') || 'النتائج المتوقعة'}
              </h4>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {proposal.expectedOutcomes}
            </p>
          </div>
        )}

        {/* Review Information */}
        {(proposal.reviewNotes || proposal.reviewedAt || proposal.reviewer) && (
          <div className="p-4 rounded-lg bg-muted border border-muted-foreground/20">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold">{t('proposal.reviewInformation') || 'معلومات المراجعة'}</h4>
            </div>
            
            {proposal.reviewer && (
              <div className="mb-3 pb-3 border-b border-muted-foreground/20">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    {t('proposal.reviewer') || 'المراجع'}
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
                  <h5 className="text-sm font-medium">{t('proposal.reviewNotes') || 'ملاحظات المراجعة'}</h5>
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
                    {t('proposal.reviewedAt') || 'تاريخ المراجعة'}: {formatDate(proposal.reviewedAt)}
                  </span>
                </div>
              )}
              {proposal.reviewedBy && !proposal.reviewer && (
                <div>
                  <span>{t('proposal.reviewedBy') || 'تمت المراجعة بواسطة'}: {proposal.reviewedBy}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ModalDialog>
  )
}
