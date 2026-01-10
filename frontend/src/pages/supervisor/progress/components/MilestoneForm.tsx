import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { Button, Input, Textarea, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { ModalDialog } from '@/components/common'
import { AlertCircle, Loader2 } from 'lucide-react'
import type { ProjectMilestone } from '@/types/project.types'
import type { MilestoneFormData } from '../types/milestone.types'

const milestoneFormSchema = (t: (key: string) => string) => z.object({
  title: z.string().min(1, t('milestone.titleRequired')),
  description: z.string().optional(),
  dueDate: z.string().min(1, t('milestone.dueDateRequired')),
  type: z.enum(['document_submission', 'meeting', 'discussion', 'other'], {
    required_error: t('milestone.typeRequired'),
  }),
})

interface MilestoneFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: MilestoneFormData) => Promise<void>
  milestone?: ProjectMilestone | null
  isPending?: boolean
}

export function MilestoneForm({
  open,
  onClose,
  onSubmit,
  milestone,
  isPending = false,
}: MilestoneFormProps) {
  const { t } = useTranslation()
  const isEditMode = !!milestone

  const form = useForm<MilestoneFormData>({
    resolver: zodResolver(milestoneFormSchema(t)),
    defaultValues: {
      title: milestone?.title || '',
      description: milestone?.description || '',
      dueDate: milestone?.dueDate ? new Date(milestone.dueDate).toISOString().split('T')[0] : '',
      type: milestone?.type || 'other',
    },
  })

  const { register, handleSubmit, formState: { errors }, reset, watch } = form

  const handleFormSubmit = async (data: MilestoneFormData) => {
    await onSubmit(data)
    if (!isEditMode) {
      reset()
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const typeOptions = [
    { value: 'document_submission', label: t('milestone.types.documentSubmission') },
    { value: 'meeting', label: t('milestone.types.meeting') },
    { value: 'discussion', label: t('milestone.types.discussion') },
    { value: 'other', label: t('milestone.types.other') },
  ]

  return (
    <ModalDialog
      open={open}
      onOpenChange={handleClose}
      title={isEditMode ? t('milestone.editMilestone') : t('milestone.createMilestone')}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">{t('milestone.title')} *</Label>
          <Input
            id="title"
            {...register('title')}
            placeholder={t('milestone.titlePlaceholder')}
            className={errors.title ? 'border-destructive' : ''}
          />
          {errors.title && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.title.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">{t('milestone.type')} *</Label>
          <Select
            value={watch('type')}
            onValueChange={(value) => form.setValue('type', value as MilestoneFormData['type'])}
          >
            <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
              <SelectValue placeholder={t('milestone.selectType')} />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map((option) => (
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

        <div className="space-y-2">
          <Label htmlFor="dueDate">{t('milestone.dueDate')} *</Label>
          <Input
            id="dueDate"
            type="date"
            {...register('dueDate')}
            className={errors.dueDate ? 'border-destructive' : ''}
            min={new Date().toISOString().split('T')[0]}
          />
          {errors.dueDate && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.dueDate.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">{t('milestone.description')}</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder={t('milestone.descriptionPlaceholder')}
            rows={4}
            className={errors.description ? 'border-destructive' : ''}
          />
          {errors.description && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('common.saving')}
              </>
            ) : (
              isEditMode ? t('common.update') : t('common.create')
            )}
          </Button>
        </div>
      </form>
    </ModalDialog>
  )
}
