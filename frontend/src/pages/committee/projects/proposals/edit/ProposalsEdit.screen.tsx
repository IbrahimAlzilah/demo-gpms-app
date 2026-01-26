import { useTranslation } from 'react-i18next'
import { Button, Input, Textarea, Label } from '@/components/ui'
import { ModalDialog, LoadingSpinner } from '@/components/common'
import { AlertCircle, Loader2, AlertTriangle } from 'lucide-react'
import { useProposalsEdit } from './ProposalsEdit.hook'

interface ProposalsEditProps {
  proposalId: string
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function ProposalsEdit({
  proposalId,
  open,
  onClose,
  onSuccess,
}: ProposalsEditProps) {
  const { t } = useTranslation()
  const { form, proposal, isLoading, isSubmitting, handleSubmit } = useProposalsEdit(proposalId, () => {
    onSuccess?.()
    onClose()
  })

  const { register, formState: { errors } } = form

  if (isLoading) {
    return (
      <ModalDialog open={open} onOpenChange={onClose} title={t('committee.proposal.editProposal')}>
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner />
        </div>
      </ModalDialog>
    )
  }

  if (!proposal) {
    return (
      <ModalDialog open={open} onOpenChange={onClose} title={t('committee.proposal.editProposal')}>
        <div className="p-4 text-center text-muted-foreground">
          <p>{t('proposal.loadError')}</p>
        </div>
      </ModalDialog>
    )
  }

  const isApprovedOrRejected = proposal.status === 'approved' || proposal.status === 'rejected'

  return (
    <ModalDialog
      open={open}
      onOpenChange={(open) => !open && onClose()}
      title={t('committee.proposal.editProposal')}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        {/* Warning for approved/rejected proposals */}
        {isApprovedOrRejected && (
          <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-warning-foreground">
                {t('committee.proposal.editingApprovedProposal')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('committee.proposal.editingApprovedProposalDesc')}
              </p>
            </div>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="title">
            {t('proposal.title')} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            {...register('title')}
            placeholder={t('proposal.titlePlaceholder')}
            className={errors.title ? 'border-destructive' : ''}
            aria-invalid={!!errors.title}
          />
          {errors.title && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.title.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            {t('proposal.description')} <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder={t('proposal.descriptionPlaceholder')}
            rows={5}
            className={errors.description ? 'border-destructive' : ''}
            aria-invalid={!!errors.description}
          />
          {errors.description && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6 border-t pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('common.saving')}
              </>
            ) : (
              t('common.save')
            )}
          </Button>
        </div>
      </form>
    </ModalDialog>
  )
}
