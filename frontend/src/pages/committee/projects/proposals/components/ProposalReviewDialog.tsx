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
import type { Proposal } from "@/types/project.types"
import { proposalReviewSchema, type ProposalReviewSchema } from "../schema"

interface ProposalReviewDialogProps {
  proposal: Proposal | null
  action: "approve" | "reject" | "modify" | null
  onClose: () => void
  onConfirm: (proposalId: string, actionType: "approve" | "reject" | "modify", notes?: string) => void
  isLoading?: boolean
}

export function ProposalReviewDialog({
  proposal,
  action,
  onClose,
  onConfirm,
  isLoading = false,
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

  return (
    <Dialog open={!!proposal && !!action} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{actionLabels[action]}</DialogTitle>
          <DialogDescription>{actionDescriptions[action]}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">{proposal.title}</h4>
              <p className="text-sm text-muted-foreground">{proposal.description}</p>
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
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.notes.message}
                  </p>
                )}
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
