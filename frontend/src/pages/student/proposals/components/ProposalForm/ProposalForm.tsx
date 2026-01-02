import { useTranslation } from 'react-i18next'
import { Button, Input, Textarea, Label } from '@/components/ui'
import { LoadingSpinner, FileUpload } from '@/components/common'
import { AlertCircle, FileText, Loader2, Calendar } from 'lucide-react'
import type { UseProposalFormReturn } from '../../hooks/useProposalForm'

interface ProposalFormProps {
  form: UseProposalFormReturn['form']
  attachedFiles: UseProposalFormReturn['attachedFiles']
  error: UseProposalFormReturn['error']
  isPeriodActive: UseProposalFormReturn['isPeriodActive']
  periodLoading: UseProposalFormReturn['periodLoading']
  handleSubmit: UseProposalFormReturn['handleSubmit']
  handleFileChange: UseProposalFormReturn['handleFileChange']
  watch: UseProposalFormReturn['watch']
  isSubmitting?: boolean
  isEditMode?: boolean
  onCancel?: () => void
}

export function ProposalForm({
  form,
  attachedFiles,
  error,
  isPeriodActive,
  periodLoading,
  handleSubmit,
  handleFileChange,
  watch,
  isSubmitting = false,
  isEditMode = false,
  onCancel,
}: ProposalFormProps) {
  const { t } = useTranslation()
  const { register, formState: { errors } } = form

  const title = watch('title')
  const description = watch('description')
  const objectives = watch('objectives')

  if (periodLoading) {
    return <LoadingSpinner />
  }

  if (!isPeriodActive) {
    return (
      <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
        <Calendar className="h-5 w-5 text-warning mt-0.5" />
        <div>
          <p className="text-sm font-medium text-warning-foreground">
            {t('proposal.periodClosedMessage')}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('proposal.periodClosedDescription')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {error && (
        <div className="flex items-start gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
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
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.title.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {title?.length || 0} / 200 {t('common.characters')}
          </p>
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
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.description.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {description?.length || 0} {t('common.characters')}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="objectives">
            {t('proposal.objectives')} <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="objectives"
            {...register('objectives')}
            placeholder={t('proposal.objectivesPlaceholder')}
            rows={4}
            className={errors.objectives ? 'border-destructive' : ''}
            aria-invalid={!!errors.objectives}
          />
          {errors.objectives && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.objectives.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {objectives?.length || 0} {t('common.characters')}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="methodology">
            {t('proposal.methodology')} ({t('common.optional')})
          </Label>
          <Textarea
            id="methodology"
            {...register('methodology')}
            placeholder={t('proposal.methodologyPlaceholder')}
            rows={4}
            className={errors.methodology ? 'border-destructive' : ''}
            aria-invalid={!!errors.methodology}
          />
          {errors.methodology && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.methodology.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="expectedOutcomes">
            {t('proposal.expectedOutcomes')} ({t('common.optional')})
          </Label>
          <Textarea
            id="expectedOutcomes"
            {...register('expectedOutcomes')}
            placeholder={t('proposal.expectedOutcomesPlaceholder')}
            rows={4}
            className={errors.expectedOutcomes ? 'border-destructive' : ''}
            aria-invalid={!!errors.expectedOutcomes}
          />
          {errors.expectedOutcomes && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.expectedOutcomes.message}
            </p>
          )}
        </div>

        <div className="space-y-2 col-span-2">
          <Label>
            {t('proposal.attachments')} ({t('common.optional')})
          </Label>
          <FileUpload
            value={attachedFiles}
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt"
            maxSize={10 * 1024 * 1024}
            multiple={true}
          />
          <p className="text-xs text-muted-foreground">
            {t('proposal.fileUploadHint')}
          </p>
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-4 border-t">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || !isPeriodActive}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditMode ? t('proposal.updating') : t('proposal.submitting')}
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              {isEditMode ? t('proposal.update') : t('proposal.submit')}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
