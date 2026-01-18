import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { usePeriodCheck } from '@/hooks/usePeriodCheck'
import { finalEvaluationSchema, type FinalEvaluationSchema } from '../schema'

export interface UseEvaluationFormOptions {
  defaultValues?: Partial<FinalEvaluationSchema>
  onSubmit?: (data: FinalEvaluationSchema) => Promise<void>
}

/**
 * Hook for managing evaluation form state and validation
 */
export function useEvaluationForm(options: UseEvaluationFormOptions = {}) {
  const { t } = useTranslation()
  const { isPeriodActive, isLoading: periodLoading } = usePeriodCheck('discussion_evaluation')

  const form = useForm<FinalEvaluationSchema>({
    resolver: zodResolver(finalEvaluationSchema(t)),
    defaultValues: {
      score: '',
      maxScore: '100',
      comments: '',
      ...options.defaultValues,
    },
  })

  const handleSubmit = async (data: FinalEvaluationSchema) => {
    if (!isPeriodActive) {
      toast.error(t('discussion.evaluationPeriodClosed'))
      return
    }

    try {
      await options.onSubmit?.(data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('discussion.evaluationError'))
    }
  }

  const resetForm = () => {
    form.reset()
  }

  return {
    form,
    isPeriodActive,
    periodLoading,
    handleSubmit: form.handleSubmit(handleSubmit),
    validateAndSubmit: handleSubmit,
    resetForm,
    watch: form.watch,
  } as const
}

export type UseEvaluationFormReturn = ReturnType<typeof useEvaluationForm>
