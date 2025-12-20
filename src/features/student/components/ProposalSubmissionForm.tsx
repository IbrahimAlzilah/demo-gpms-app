import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useCreateProposal } from '../hooks/useProposals'
import { usePeriodCheck } from '../../../hooks/usePeriodCheck'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Textarea } from '../../../components/ui/textarea'
import { proposalSchema, type ProposalSchema } from '../schema'

export function ProposalSubmissionForm() {
  const { t } = useTranslation()
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProposalSchema>({
    resolver: zodResolver(proposalSchema(t)),
    defaultValues: {
      title: '',
      description: '',
      objectives: '',
      methodology: '',
      expectedOutcomes: '',
    },
  })
  const createProposal = useCreateProposal()
  const { isPeriodActive } = usePeriodCheck('proposal_submission')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const onSubmit = async (data: ProposalSchema) => {
    if (!isPeriodActive) {
      setError('فترة تقديم المقترحات غير مفتوحة حالياً')
      return
    }

    setError('')
    setSuccess(false)

    try {
      await createProposal.mutateAsync({
        ...data,
        submitterId: '', // Will be set by service
      })
      setSuccess(true)
      reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تقديم المقترح')
    }
  }

  if (!isPeriodActive) {
    return (
      <div className="p-4 bg-warning/10 border border-warning/20 rounded-md">
        <p className="text-warning">فترة تقديم المقترحات غير مفتوحة حالياً</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 text-sm text-success bg-success/10 border border-success/20 rounded-md">
          تم تقديم المقترح بنجاح وسيتم مراجعته من قبل لجنة المشاريع
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">{t('proposal.title') || 'عنوان المشروع'} *</Label>
        <Input
          id="title"
          {...register('title')}
          placeholder={t('proposal.titlePlaceholder') || 'أدخل عنوان المشروع'}
          className={errors.title ? 'border-destructive' : ''}
        />
        {errors.title && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <span>{errors.title.message}</span>
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t('proposal.description') || 'وصف المشروع'} *</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder={t('proposal.descriptionPlaceholder') || 'أدخل وصفاً مفصلاً للمشروع'}
          rows={5}
          className={errors.description ? 'border-destructive' : ''}
        />
        {errors.description && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <span>{errors.description.message}</span>
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="objectives">{t('proposal.objectives') || 'أهداف المشروع'} *</Label>
        <Textarea
          id="objectives"
          {...register('objectives')}
          placeholder={t('proposal.objectivesPlaceholder') || 'اذكر أهداف المشروع'}
          rows={4}
          className={errors.objectives ? 'border-destructive' : ''}
        />
        {errors.objectives && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <span>{errors.objectives.message}</span>
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="methodology">المنهجية</Label>
        <Textarea
          id="methodology"
          {...register('methodology')}
          placeholder="اذكر المنهجية المتبعة (اختياري)"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="expectedOutcomes">النتائج المتوقعة</Label>
        <Textarea
          id="expectedOutcomes"
          {...register('expectedOutcomes')}
          placeholder="اذكر النتائج المتوقعة (اختياري)"
          rows={4}
        />
      </div>

      <Button
        type="submit"
        disabled={createProposal.isPending}
        className="w-full"
      >
        {createProposal.isPending ? 'جاري الإرسال...' : 'تقديم المقترح'}
      </Button>
    </form>
  )
}

