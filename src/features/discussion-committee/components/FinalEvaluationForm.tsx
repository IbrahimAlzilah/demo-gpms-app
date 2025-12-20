import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSubmitFinalGrade } from '../hooks/useFinalEvaluation'
import { usePeriodCheck } from '../../../hooks/usePeriodCheck'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Textarea } from '@/components/ui'
import { useAuthStore } from '../../auth/store/auth.store'
import { LoadingSpinner, useToast } from '@/components/common'
import { AlertCircle, Award, Loader2 } from 'lucide-react'
import { finalEvaluationSchema, type FinalEvaluationSchema } from '../schema'

interface FinalEvaluationFormProps {
  projectId: string
  studentId: string
  onSuccess?: () => void
}

export function FinalEvaluationForm({
  projectId,
  studentId,
  onSuccess,
}: FinalEvaluationFormProps) {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const submitGrade = useSubmitFinalGrade()
  const { user } = useAuthStore()
  const { isPeriodActive, isLoading: periodLoading } = usePeriodCheck('committee_evaluation')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FinalEvaluationSchema>({
    resolver: zodResolver(finalEvaluationSchema(t)),
    defaultValues: {
      score: '',
      maxScore: '100',
      comments: '',
    },
  })

  const onSubmit = async (data: FinalEvaluationSchema) => {
    if (!isPeriodActive) {
      showToast(t('discussion.evaluationPeriodClosed'), 'error')
      return
    }

    if (!user) {
      showToast(t('discussion.userNotFound'), 'error')
      return
    }

    const scoreNum = parseFloat(data.score)
    const maxScoreNum = parseFloat(data.maxScore)

    try {
      await submitGrade.mutateAsync({
        projectId,
        studentId,
        grade: {
          score: scoreNum,
          maxScore: maxScoreNum,
          criteria: {},
          comments: data.comments || undefined,
        },
        committeeMembers: [user.id], // In real app, get from committee assignment
      })
      showToast(t('discussion.evaluationSaved'), 'success')
      reset()
      onSuccess?.()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t('discussion.evaluationError')
      showToast(errorMsg, 'error')
    }
  }

  if (periodLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  if (!isPeriodActive) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            {t('discussion.evaluationPeriodClosed')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-warning/10 border border-warning/20 rounded-md">
            <p className="text-warning">
              {t('discussion.evaluationPeriodClosedMessage')}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          {t('discussion.finalEvaluation')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errors.score && (
            <div className="flex items-start gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{errors.score.message}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="score">{t('discussion.score')} *</Label>
              <Input
                id="score"
                type="number"
                {...register('score')}
                min="0"
                placeholder="0"
                className={errors.score ? 'border-destructive' : ''}
                aria-invalid={!!errors.score}
              />
              {errors.score && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.score.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxScore">{t('discussion.maxScore')} *</Label>
              <Input
                id="maxScore"
                type="number"
                {...register('maxScore')}
                min="0"
                placeholder="100"
                className={errors.maxScore ? 'border-destructive' : ''}
                aria-invalid={!!errors.maxScore}
              />
              {errors.maxScore && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.maxScore.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">{t('discussion.comments')} ({t('common.optional')})</Label>
            <Textarea
              id="comments"
              {...register('comments')}
              placeholder={t('discussion.commentsPlaceholder')}
              rows={4}
            />
          </div>

          <Button
            type="submit"
            disabled={submitGrade.isPending}
            className="w-full"
          >
            {submitGrade.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('common.saving')}
              </>
            ) : (
              t('discussion.saveEvaluation')
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

