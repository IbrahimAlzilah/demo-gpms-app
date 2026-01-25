import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch, DatePicker } from '@/components/ui'
import { ModalDialog } from '@/components/common'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { timePeriodSchema, type TimePeriodSchema } from '../../schema'
import type { TimePeriod } from '@/types/period.types'

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

  // Convert ISO date strings to YYYY-MM-DD format for date inputs
  const formatDateForInput = (dateString?: string): string => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ''
      return date.toISOString().split('T')[0]
    } catch {
      return ''
    }
  }

  const form = useForm<TimePeriodSchema>({
    resolver: zodResolver(timePeriodSchema(t, isEditMode)),
    defaultValues: {
      name: period?.name || '',
      type: period?.type || 'general',
      startDate: formatDateForInput(period?.startDate) || '',
      endDate: formatDateForInput(period?.endDate) || '',
      academicYear: period?.academicYear || '',
      semester: period?.semester || '',
      ...(isEditMode && { isActive: period?.isActive ?? false }),
    },
  })

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = form

  // Reset form when modal opens or period changes
  useEffect(() => {
    if (open) {
      if (period) {
        reset({
          name: period.name,
          type: period.type,
          startDate: formatDateForInput(period.startDate),
          endDate: formatDateForInput(period.endDate),
          academicYear: period.academicYear || '',
          semester: period.semester || '',
          ...(isEditMode && { isActive: period.isActive ?? false }),
        } as TimePeriodSchema)
      } else {
        reset({
          name: '',
          type: 'general',
          startDate: '',
          endDate: '',
          academicYear: '',
          semester: '',
        })
      }
    }
  }, [open, period, reset])

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
    { value: 'chapter_submission_phase_1', label: t('committee.periods.types.chapterSubmissionPhase1') },
    { value: 'final_defense_phase_1', label: t('committee.periods.types.finalDefensePhase1') },
    { value: 'chapter_submission_phase_2', label: t('committee.periods.types.chapterSubmissionPhase2') },
    { value: 'final_defense_phase_2', label: t('committee.periods.types.finalDefensePhase2') },
    { value: 'final_project_document_submission', label: t('committee.periods.types.finalProjectDocumentSubmission') },
    { value: 'grade_approval', label: t('committee.periods.types.gradeApproval') },
    { value: 'general', label: t('committee.periods.types.general') },
  ]

  return (
    <ModalDialog
      open={open}
      onOpenChange={handleClose}
      title={isEditMode ? t('committee.periods.editPeriod') : t('committee.periods.createNew')}
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
            <p className="text-xs text-destructive flex items-center gap-1">
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
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.type.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <DatePicker
            name="startDate"
            label={t('committee.periods.startDate')}
            value={watch('startDate') || ''}
            onChange={(value) => setValue('startDate', value, { shouldValidate: true })}
            required
            error={errors.startDate?.message}
            max={watch('endDate') || undefined}
          />

          <DatePicker
            id="endDate"
            label={t('committee.periods.endDate')}
            value={watch('endDate') || ''}
            onChange={(value) => setValue('endDate', value, { shouldValidate: true })}
            required
            error={errors.endDate?.message}
            min={watch('startDate') || undefined}
          />
        </div>

        {isEditMode && (
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div className="space-y-0.5">
              <Label htmlFor="isActive" className="text-base">
                {t('committee.periods.status')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('committee.periods.statusDescription')}
              </p>
            </div>
            <Switch
              id="isActive"
              checked={(watch('isActive' as keyof TimePeriodSchema) as boolean | undefined) ?? false}
              onCheckedChange={(checked) => setValue('isActive' as keyof TimePeriodSchema, checked as never, { shouldValidate: true })}
            />
          </div>
        )}

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
