import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSubmitFinalGrade } from '../hooks/useFinalEvaluation'
import { usePeriodCheck } from '@/hooks/usePeriodCheck'
import { useAuthStore } from '@/pages/auth/login'
import { finalEvaluationSchema, type FinalEvaluationSchema } from '../schema'
import type { EvaluationNewState } from './EvaluationNew.types'

export function useEvaluationNew(projectId: string, studentId: string, onSuccess?: () => void) {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { isPeriodActive, isLoading: periodLoading } = usePeriodCheck('committee_evaluation')
  const submitGrade = useSubmitFinalGrade()
  
  const [state, setState] = useState<EvaluationNewState>({
    isSubmitting: false,
  })

  const form = useForm<FinalEvaluationSchema>({
    resolver: zodResolver(finalEvaluationSchema(t)),
    defaultValues: {
      score: '',
      maxScore: '100',
      comments: '',
    },
  })

  const handleSubmit = async (data: FinalEvaluationSchema) => {
    if (!isPeriodActive) {
      return { error: t('discussion.evaluationPeriodClosed') }
    }

    if (!user) {
      return { error: t('discussion.userNotFound') }
    }

    setState((prev) => ({ ...prev, isSubmitting: true }))

    try {
      const scoreNum = parseFloat(data.score)
      const maxScoreNum = parseFloat(data.maxScore)

      await submitGrade.mutateAsync({
        projectId,
        studentId,
        grade: {
          score: scoreNum,
          maxScore: maxScoreNum,
          criteria: {},
          comments: data.comments || undefined,
        },
        committeeMembers: [user.id],
      })

      form.reset()
      onSuccess?.()
      return { success: true }
    } catch (err) {
      return { error: err instanceof Error ? err.message : t('discussion.evaluationError') }
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }))
    }
  }

  return {
    form,
    state,
    isPeriodActive,
    periodLoading,
    handleSubmit,
    t,
  }
}
