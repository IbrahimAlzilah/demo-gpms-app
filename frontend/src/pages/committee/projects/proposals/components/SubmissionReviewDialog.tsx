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
import { AlertCircle } from "lucide-react"
import type { ProposalSubmission } from "@/types/project.types"
import { z } from "zod"

const submissionReviewSchema = (t: (key: string) => string, action: string) => {
  if (action === "modify") {
    return z.object({
      notes: z.string().min(1, t('committee.proposal.modificationsRequired')),
      projectId: z.string().optional(),
    })
  }
  return z.object({
    notes: z.string().optional(),
    projectId: z.string().optional(),
  })
}

type SubmissionReviewSchema = z.infer<ReturnType<typeof submissionReviewSchema>>

interface SubmissionReviewDialogProps {
  submission: ProposalSubmission | null
  action: "approve" | "reject" | "modify" | null
  onClose: () => void
  onConfirm: (submissionId: string, actionType: "approve" | "reject" | "modify", notes?: string, projectId?: string) => void
  isLoading?: boolean
}

export function SubmissionReviewDialog({
  submission,
  action,
  onClose,
  onConfirm,
  isLoading = false,
}: SubmissionReviewDialogProps) {
  const { t } = useTranslation()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<SubmissionReviewSchema>({
    resolver: zodResolver(submissionReviewSchema(t, action || "approve")),
    defaultValues: {
      notes: "",
      projectId: "",
    },
  })

  if (!submission || !action) return null

  const onSubmit = (data: SubmissionReviewSchema) => {
    onConfirm(submission.id, action, data.notes?.trim() || undefined, data.projectId?.trim() || undefined)
    reset()
    onClose()
  }

  const actionLabels = {
    approve: t('committee.proposal.approve'),
    reject: t('committee.proposal.reject'),
    modify: t('committee.proposal.requestModification'),
  }

  const actionDescriptions = {
    approve: t('committee.proposal.confirmApproveSubmission'),
    reject: t('committee.proposal.rejectDescription'),
    modify: t('committee.proposal.modifyDescription'),
  }

  return (
    <Dialog open={!!submission && !!action} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{actionLabels[action]}</DialogTitle>
          <DialogDescription>{actionDescriptions[action]}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">
                {t('proposal.submissionFrom')} {submission.submitter?.name || submission.studentGroup?.name}
              </h4>
              <p className="text-sm text-muted-foreground mb-2">
                {t('proposal.proposalsCount')}: {submission.proposals?.length || 0}
              </p>
              {submission.proposals && submission.proposals.length > 0 && (
                <div className="space-y-2 mt-3">
                  {submission.proposals.map((proposal, index) => (
                    <div key={proposal.id} className="p-2 bg-muted rounded text-sm">
                      <span className="font-medium">{index + 1}. {proposal.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {(action === "reject" || action === "modify") && (
              <div className="space-y-2">
                <Label htmlFor="notes">
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
                  rows={4}
                  className={errors.notes ? "border-destructive" : ""}
                  aria-invalid={!!errors.notes}
                />
                {errors.notes && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.notes.message}
                  </p>
                )}
              </div>
            )}
            {action === "approve" && (
              <div className="space-y-2">
                <Label htmlFor="projectId">
                  {t('committee.proposal.projectIdOptional')}
                </Label>
                <input
                  id="projectId"
                  type="text"
                  {...register("projectId")}
                  placeholder={t('committee.proposal.projectIdPlaceholder')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              variant={action === "reject" ? "destructive" : "default"}
            >
              {isLoading ? t('common.processing') : t('common.confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
