import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSubmitGrade } from '../hooks/useEvaluation'
import { usePeriodCheck } from '../../../hooks/usePeriodCheck'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Textarea } from '../../../components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import { useToast } from '../../../components/common/NotificationToast'
import { AlertCircle, Loader2, Award } from 'lucide-react'
import { evaluationSchema, type EvaluationSchema } from '../schema'

interface EvaluationFormProps {
  projectId: string
  studentId: string
  onSuccess?: () => void
}

export function EvaluationForm({ projectId, studentId, onSuccess }: EvaluationFormProps) {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const submitGrade = useSubmitGrade()
  const { isPeriodActive, isLoading: periodLoading } = usePeriodCheck('supervisor_evaluation')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EvaluationSchema>({
    resolver: zodResolver(evaluationSchema(t)),
    defaultValues: {
      score: '',
      maxScore: '100',
      comments: '',
    },
  })

  const onSubmit = async (data: EvaluationSchema) => {
    if (!isPeriodActive) {
      const errorMsg = t('supervisor.evaluationPeriodClosed') || 'فترة التقييم قد انتهت'
      showToast(errorMsg, 'error')
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
      })
      showToast(t('supervisor.evaluationSaved') || 'تم حفظ التقييم بنجاح', 'success')
      reset()
      onSuccess?.()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t('supervisor.evaluationError') || 'فشل حفظ التقييم'
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
            {t('supervisor.evaluationPeriodClosed') || 'فترة التقييم مغلقة'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-warning/10 border border-warning/20 rounded-md">
            <p className="text-warning">
              {t('supervisor.evaluationPeriodClosedMessage') || 'فترة التقييم قد انتهت'}
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
          {t('supervisor.evaluateProject') || 'تقييم المشروع'}
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
              <Label htmlFor="score">{t('supervisor.score') || 'الدرجة'} *</Label>
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
              <Label htmlFor="maxScore">{t('supervisor.maxScore') || 'الدرجة الكاملة'} *</Label>
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
            <Label htmlFor="comments">{t('supervisor.comments') || 'ملاحظات'} ({t('common.optional') || 'اختياري'})</Label>
            <Textarea
              id="comments"
              {...register('comments')}
              placeholder={t('supervisor.commentsPlaceholder') || 'أدخل ملاحظاتك حول التقييم'}
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
              t('supervisor.saveEvaluation') || 'حفظ التقييم'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

