import { useForm } from 'react-hook-form'
import { useToast } from '@/components/common'
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
  const { toastError } = useToast()
  // Check if final defense period is active (check both phases)
  const { isPeriodActive: isPhase1Active } = usePeriodCheck('final_defense_phase_1')
  const { isPeriodActive: isPhase2Active, isLoading: periodLoading } = usePeriodCheck('final_defense_phase_2')
  const isPeriodActive = isPhase1Active || isPhase2Active

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
      toastError('discussion.evaluationPeriodClosed')
      return
    }

    try {
      await options.onSubmit?.(data)
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'discussion.evaluationError')
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
