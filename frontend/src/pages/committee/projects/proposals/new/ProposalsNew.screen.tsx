import { useTranslation } from 'react-i18next'
import { Button, Input, Label, Textarea } from '@/components/ui'
import { ModalDialog, useToast } from '@/components/common'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useProposalsNew } from './ProposalsNew.hook'

interface ProposalsNewProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function ProposalsNew({ open, onClose, onSuccess }: ProposalsNewProps) {
  const { t } = useTranslation()
  const {
    form,
    handleSubmit,
    isSubmitting,
    resetForm,
  } = useProposalsNew(() => {
    resetForm()
    onSuccess?.()
    onClose()
  })

  const { register, formState: { errors } } = form

  return (
    <ModalDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          resetForm()
          onClose()
        }
      }}
      title={t('committee.proposal.createTitle')}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
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

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">
            {t('proposal.description')} <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder={t('proposal.descriptionPlaceholder')}
            rows={4}
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

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetForm()
              onClose()
            }}
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('common.creating')}
              </>
            ) : (
              t('common.create')
            )}
          </Button>
        </div>
      </form>
    </ModalDialog>
  )
}
