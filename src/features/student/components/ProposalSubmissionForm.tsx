import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useCreateProposal } from '../hooks/useProposals'
import { usePeriodCheck } from '../../../hooks/usePeriodCheck'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Textarea } from '../../../components/ui/textarea'
import type { Proposal } from '../../../types/project.types'

interface ProposalFormData {
  title: string
  description: string
  objectives: string
  methodology?: string
  expectedOutcomes?: string
}

export function ProposalSubmissionForm() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProposalFormData>()
  const createProposal = useCreateProposal()
  const { isPeriodActive } = usePeriodCheck('proposal_submission')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const onSubmit = async (data: ProposalFormData) => {
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
        <Label htmlFor="title">عنوان المشروع *</Label>
        <Input
          id="title"
          {...register('title', { required: 'عنوان المشروع مطلوب' })}
          placeholder="أدخل عنوان المشروع"
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">وصف المشروع *</Label>
        <Textarea
          id="description"
          {...register('description', { required: 'وصف المشروع مطلوب' })}
          placeholder="أدخل وصفاً مفصلاً للمشروع"
          rows={5}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="objectives">أهداف المشروع *</Label>
        <Textarea
          id="objectives"
          {...register('objectives', { required: 'أهداف المشروع مطلوبة' })}
          placeholder="اذكر أهداف المشروع"
          rows={4}
        />
        {errors.objectives && (
          <p className="text-sm text-destructive">{errors.objectives.message}</p>
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

