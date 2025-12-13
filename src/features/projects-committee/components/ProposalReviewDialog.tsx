import { useState } from "react"
import { useTranslation } from "react-i18next"
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
import { useToast } from "@/components/common/NotificationToast"
import type { Proposal } from "@/types/project.types"

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
  const { showToast } = useToast()
  const [notes, setNotes] = useState("")

  if (!proposal || !action) return null

  const handleConfirm = () => {
    if (action === "modify" && !notes.trim()) {
      showToast(t('committee.proposal.modifyNotesRequired') || 'يرجى إدخال ملاحظات التعديل', 'error')
      return
    }
    onConfirm(proposal.id, action, notes.trim() || undefined)
    setNotes("")
    onClose()
  }

  const actionLabels = {
    approve: t('committee.proposal.approve') || "قبول المقترح",
    reject: t('committee.proposal.reject') || "رفض المقترح",
    modify: t('committee.proposal.requestModification') || "طلب تعديل",
  }

  const actionDescriptions = {
    approve: t('committee.proposal.confirmApprove') || "هل أنت متأكد من قبول هذا المقترح؟",
    reject: t('committee.proposal.rejectDescription') || "يرجى إدخال سبب الرفض (اختياري)",
    modify: t('committee.proposal.modifyDescription') || "يرجى ذكر التعديلات المطلوبة",
  }

  return (
    <Dialog open={!!proposal && !!action} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{actionLabels[action]}</DialogTitle>
          <DialogDescription>{actionDescriptions[action]}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">{proposal.title}</h4>
            <p className="text-sm text-muted-foreground">{proposal.description}</p>
          </div>
          {(action === "reject" || action === "modify") && (
            <div className="space-y-2">
              <Label htmlFor="notes">
                {action === "modify" 
                  ? (t('committee.proposal.modificationsRequired') || "التعديلات المطلوبة")
                  : (t('committee.proposal.notesOptional') || "ملاحظات (اختياري)")
                }
                {action === "modify" && <span className="text-destructive"> *</span>}
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  action === "modify"
                    ? (t('committee.proposal.modificationsPlaceholder') || "اذكر التعديلات المطلوبة")
                    : (t('committee.proposal.notesPlaceholder') || "ملاحظات (اختياري)")
                }
                rows={4}
                className={action === "modify" && !notes.trim() ? "border-warning" : ""}
                aria-invalid={action === "modify" && !notes.trim()}
              />
              {action === "modify" && !notes.trim() && (
                <p className="text-sm text-warning flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {t('committee.proposal.modifyNotesRequired') || 'ملاحظات التعديل مطلوبة'}
                </p>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('common.cancel') || 'إلغاء'}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || (action === "modify" && !notes.trim())}
            variant={action === "reject" ? "destructive" : "default"}
          >
            {isLoading ? (t('common.processing') || "جاري المعالجة...") : (t('common.confirm') || "تأكيد")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

