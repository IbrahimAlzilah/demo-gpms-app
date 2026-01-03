import { useTranslation } from 'react-i18next'
import { useEvaluationForm } from '../hooks/useEvaluationForm'
import { useEvaluationOperations } from '../hooks/useEvaluationOperations'
import { useAuthStore } from '@/pages/auth/login'
import type { FinalEvaluationSchema } from '../schema'

export function useEvaluationNew(projectId: string, studentId: string, onSuccess?: () => void) {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const submitGrade = useSubmitFinalGrade()
  
  const {
    form,
    error,
    isPeriodActive,
    periodLoading,
    handleSubmit: handleFormSubmit,
    resetForm,
  } = useEvaluationForm({
    onSubmit: async (data: FinalEvaluationSchema) => {
      if (!user) {
        throw new Error(t('discussion.userNotFound'))
      }

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

      resetForm()
      onSuccess?.()
    },
  })

  return {
    form,
    error,
    isPeriodActive,
    periodLoading,
    handleSubmit: handleFormSubmit,
    isSubmitting: submitGrade.isPending,
    t,
  }
}
