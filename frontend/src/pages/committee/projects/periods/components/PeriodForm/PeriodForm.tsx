import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { ModalDialog } from '@/components/common'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { timePeriodSchema, type TimePeriodSchema } from '../../schema'
import type { TimePeriod } from '@/types/period.types'
import type { UsePeriodFormReturn } from '../../hooks/usePeriodForm'

interface PeriodFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: TimePeriodSchema) => Promise<void>
  period?: TimePeriod | null
  isPending?: boolean
  success?: boolean
}

export function PeriodForm({
  open,
  onClose,
  onSubmit,
  period,
  isPending = false,
  success = false,
}: PeriodFormProps) {
  const { t } = useTranslation()
  const isEditMode = !!period

  const form = useForm<TimePeriodSchema>({
    resolver: zodResolver(timePeriodSchema(t)),
    defaultValues: {
      name: period?.name || '',
      type: period?.type || 'general',
      startDate: period?.startDate || '',
      endDate: period?.endDate || '',
      academicYear: period?.academicYear || '',
      semester: period?.semester || '',
    },
  })

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = form

  const handleFormSubmit = async (data: TimePeriodSchema) => {
    await onSubmit(data)
    if (!isEditMode) {
      reset()
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const periodTypeOptions = [
    { value: 'proposal_submission', label: t('committee.periods.types.proposalSubmission') },
    { value: 'project_registration', label: t('committee.periods.types.projectRegistration') },
    { value: 'document_submission', label: t('committee.periods.types.documentSubmission') },
    { value: 'supervisor_evaluation', label: t('committee.periods.types.supervisorEvaluation') },
    { value: 'committee_evaluation', label: t('committee.periods.types.committeeEvaluation') },
    { value: 'final_discussion', label: t('committee.periods.types.finalDiscussion') },
  ]

  return (
    <ModalDialog
      open={open}
      onOpenChange={handleClose}
      title={isEditMode ? t('committee.periods.editPeriod') || 'Edit Period' : t('committee.periods.createNew')}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {success && !isEditMode && (
          <div className="flex items-start gap-2 p-3 text-sm text-success bg-success/10 border border-success/20 rounded-md">
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{t('committee.periods.periodCreated')}</span>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="name">{t('committee.periods.name')} *</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder={t('committee.periods.namePlaceholder')}
            className={errors.name ? 'border-destructive' : ''}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">{t('committee.periods.type')} *</Label>
          <Select
            value={watch('type') || ''}
            onValueChange={(value) => setValue('type', value as TimePeriodSchema['type'])}
          >
            <SelectTrigger
              id="type"
              className={errors.type ? 'border-destructive' : ''}
            >
              <SelectValue placeholder={t('committee.periods.selectType')} />
            </SelectTrigger>
            <SelectContent>
              {periodTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.type.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">{t('committee.periods.startDate')} *</Label>
            <Input
              id="startDate"
              type="date"
              {...register('startDate')}
              className={errors.startDate ? 'border-destructive' : ''}
              aria-invalid={!!errors.startDate}
            />
            {errors.startDate && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.startDate.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">{t('committee.periods.endDate')} *</Label>
            <Input
              id="endDate"
              type="date"
              {...register('endDate')}
              className={errors.endDate ? 'border-destructive' : ''}
              aria-invalid={!!errors.endDate}
            />
            {errors.endDate && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.endDate.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('common.saving')}
              </>
            ) : (
              isEditMode ? t('common.update') : t('committee.periods.announcePeriod')
            )}
          </Button>
        </div>
      </form>
    </ModalDialog>
  )
}
