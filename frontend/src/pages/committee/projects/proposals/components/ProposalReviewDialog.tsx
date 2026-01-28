import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { StatusBadge } from "@/components/common"
import { AlertCircle, FileText, User, Users, Calendar, Loader2, CheckCircle, XCircle, FileEdit, AlertTriangle } from "lucide-react"
import { formatDate } from "@/lib/utils/format"
import { cn } from "@/lib/utils"
import type { Proposal, Project } from "@/types/project.types"
import { proposalReviewSchema, type ProposalReviewSchema } from "../schema"

interface ProposalReviewDialogProps {
  proposal: Proposal | null
  action: "approve" | "reject" | "modify" | null
  onClose: () => void
  onConfirm: (proposalId: string, actionType: "approve" | "reject" | "modify", notes?: string) => void
  isLoading?: boolean
  approvedProject?: Project | null // Group's already approved project (if any)
  canApproveNewProject?: boolean // Whether a new project can be approved for this group
}

export function ProposalReviewDialog({
  proposal,
  action,
  onClose,
  onConfirm,
  isLoading = false,
  approvedProject,
  canApproveNewProject = true,
}: ProposalReviewDialogProps) {
  const { t } = useTranslation()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProposalReviewSchema>({
    resolver: zodResolver(proposalReviewSchema(t, action || "approve")),
    defaultValues: {
      notes: "",
    },
  })

  if (!proposal || !action) return null

  const onSubmit = (data: ProposalReviewSchema) => {
    onConfirm(proposal.id, action, data.notes?.trim() || undefined)
    reset()
    onClose()
  }

  const actionLabels = {
    approve: t('committee.proposal.approve'),
    reject: t('committee.proposal.reject'),
    modify: t('committee.proposal.requestModification'),
  }

  const actionDescriptions = {
    approve: t('committee.proposal.confirmApprove'),
    reject: t('committee.proposal.rejectDescription'),
    modify: t('committee.proposal.modifyDescription'),
  }

  const getActionIcon = () => {
    switch (action) {
      case "approve":
        return <CheckCircle className="h-5 w-5 text-emerald-600" />
      case "reject":
        return <XCircle className="h-5 w-5 text-rose-600" />
      case "modify":
        return <FileEdit className="h-5 w-5 text-amber-600" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getActionColor = () => {
    switch (action) {
      case "approve":
        return "border-emerald-200 dark:border-emerald-800"
      case "reject":
        return "border-rose-200 dark:border-rose-800"
      case "modify":
        return "border-amber-200 dark:border-amber-800"
      default:
        return ""
    }
  }

  return (
    <Dialog open={!!proposal && !!action} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              action === "approve" && "bg-emerald-100 dark:bg-emerald-900/30",
              action === "reject" && "bg-rose-100 dark:bg-rose-900/30",
              action === "modify" && "bg-amber-100 dark:bg-amber-900/30"
            )}>
              {getActionIcon()}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg">{actionLabels[action]}</DialogTitle>
              <DialogDescription className="mt-1">{actionDescriptions[action]}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            {/* Proposal Details */}
            <div className={cn(
              "p-4 rounded-lg border bg-muted/30",
              getActionColor()
            )}>
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h4 className="font-semibold text-base">{proposal.title}</h4>
                    <StatusBadge status={proposal.status} />
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {proposal.description}
                  </p>
                </div>
              </div>

              {/* Proposal Metadata */}
              <div className="space-y-3 pt-3 border-t border-border/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {proposal.submitter && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      <span>
                        <span className="font-medium">{t('proposal.submittedBy')}:</span> {proposal.submitter.name || proposal.submitter.email}
                      </span>
                    </div>
                  )}
                  {proposal.studentGroup && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      <span>
                        <span className="font-medium">{t('proposal.group')}:</span> {proposal.studentGroup.name || proposal.studentGroup.groupCode || `Group #${proposal.studentGroup.id}`}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      <span className="font-medium">{t('proposal.submittedAt')}:</span> {formatDate(proposal.createdAt)}
                    </span>
                  </div>
                  {proposal.reviewedAt && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        <span className="font-medium">{t('proposal.reviewedAt')}:</span> {formatDate(proposal.reviewedAt)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Warning: Group already has an approved project */}
                {action === "approve" && proposal.studentGroup && !canApproveNewProject && approvedProject && (
                  <div className="mt-3 p-3 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs space-y-1.5">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-amber-900 dark:text-amber-100">
                          {t('committee.proposal.groupHasApprovedProjectWarning') ||
                            'Group Already Has Approved Project'}
                        </p>
                        <p className="text-amber-800 dark:text-amber-200 mt-1">
                          {t('committee.proposal.groupHasApprovedProjectMessage', {
                            project: approvedProject.title || t('common.project'),
                            defaultValue: `This group already has an approved project: ${approvedProject.title || 'N/A'}. Only one project can be approved per group. Approving this proposal will fail.`
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Supervisor assignment hint for approved supervisor-origin proposals */}
                {action === "approve" && proposal.proposedSupervisor && (
                  <div className="mt-3 p-3 rounded-md bg-primary/5 border border-primary/20 text-xs text-muted-foreground space-y-1.5">
                    <p className="font-medium text-primary">
                      {t('committee.proposal.supervisorAssignmentHintTitle') ||
                        'Supervisor assignment and approval'}
                    </p>
                    <p>
                      {t('committee.proposal.supervisorAssignmentHintBody', {
                        supervisor: proposal.proposedSupervisor.name || proposal.proposedSupervisor.email || '',
                      }) ||
                        'Approving this proposal will link the proposed supervisor to the group. The supervisor must still confirm the supervision request before the assignment becomes final.'}
                    </p>
                  </div>
                )}

                {/* Student Group Details */}
                {proposal.studentGroup && (
                  <div className="p-3 rounded-md bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-semibold">{t('proposal.studentGroup') || 'Student Group Details'}</span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      {proposal.studentGroup.leader && (
                        <div className="text-muted-foreground">
                          <span className="font-medium">{t('proposal.groupLeader') || 'Leader'}:</span> {proposal.studentGroup.leader.name}
                          {proposal.studentGroup.leader.email && ` (${proposal.studentGroup.leader.email})`}
                        </div>
                      )}
                      {proposal.studentGroup.members && proposal.studentGroup.members.length > 0 && (
                        <div className="text-muted-foreground">
                          <span className="font-medium">{t('proposal.groupMembers') || 'Members'}:</span> {proposal.studentGroup.members.length}
                        </div>
                      )}
                      {proposal.studentGroup.memberCount !== undefined && (
                        <div className="text-muted-foreground">
                          <span className="font-medium">{t('common.totalMembers') || 'Total'}:</span> {proposal.studentGroup.memberCount}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Supervisor Information */}
                {proposal.proposedSupervisor && (
                  <div className="p-3 rounded-md bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-semibold">{t('proposal.proposedSupervisor') || 'Proposed Supervisor'}</span>
                    </div>
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="font-medium">{proposal.proposedSupervisor.name}</div>
                      {proposal.proposedSupervisor.email && (
                        <div>{proposal.proposedSupervisor.email}</div>
                      )}
                      {proposal.proposedSupervisor.department && (
                        <div>{proposal.proposedSupervisor.department}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Review Notes Section */}
            {(action === "reject" || action === "modify") && (
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">
                  {action === "modify"
                    ? t('committee.proposal.modificationsRequired')
                    : t('committee.proposal.notesOptional')
                  }
                  {action === "modify" && <span className="text-destructive"> *</span>}
                </Label>
                <Textarea
                  id="notes"
                  {...register("notes")}
                  placeholder={
                    action === "modify"
                      ? t('committee.proposal.modificationsPlaceholder')
                      : t('committee.proposal.notesPlaceholder')
                  }
                  rows={5}
                  className={cn(
                    "resize-none transition-all",
                    errors.notes ? "border-destructive focus:ring-destructive/20" : "focus:ring-primary/20"
                  )}
                  aria-invalid={!!errors.notes}
                />
                {errors.notes && (
                  <p className="text-xs text-destructive flex items-center gap-1.5 animate-in slide-in-from-top-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {errors.notes.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {action === "modify"
                    ? t('committee.proposal.modifyHint') || "Please provide clear instructions on what modifications are needed."
                    : t('committee.proposal.rejectHint') || "Optional: Provide feedback on why this proposal was rejected."
                  }
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="mt-6 gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading || (action === "approve" && !canApproveNewProject && proposal?.studentGroup)}
              variant={action === "reject" ? "destructive" : "default"}
              className="min-w-[100px]"
              title={
                action === "approve" && !canApproveNewProject && proposal?.studentGroup
                  ? t('committee.proposal.cannotApproveAnotherProject') ||
                  'Cannot approve another project for this group'
                  : undefined
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common.processing')}
                </>
              ) : (
                t('common.confirm')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
