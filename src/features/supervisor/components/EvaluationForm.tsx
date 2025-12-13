import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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

interface EvaluationFormProps {
  projectId: string
  studentId: string
  onSuccess?: () => void
}

export function EvaluationForm({ projectId, studentId, onSuccess }: EvaluationFormProps) {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const [score, setScore] = useState('')
  const [maxScore, setMaxScore] = useState('100')
  const [comments, setComments] = useState('')
  const submitGrade = useSubmitGrade()
  const { isPeriodActive, isLoading: periodLoading } = usePeriodCheck('supervisor_evaluation')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!isPeriodActive) {
      const errorMsg = t('supervisor.evaluationPeriodClosed') || 'فترة التقييم قد انتهت'
      setError(errorMsg)
      showToast(errorMsg, 'error')
      return
    }

    const scoreNum = parseFloat(score)
    const maxScoreNum = parseFloat(maxScore)

    if (isNaN(scoreNum) || isNaN(maxScoreNum) || scoreNum < 0 || scoreNum > maxScoreNum) {
      const errorMsg = t('supervisor.invalidScore') || 'الدرجة غير صالحة'
      setError(errorMsg)
      showToast(errorMsg, 'error')
      return
    }

    try {
      await submitGrade.mutateAsync({
        projectId,
        studentId,
        grade: {
          score: scoreNum,
          maxScore: maxScoreNum,
          criteria: {},
          comments: comments || undefined,
        },
      })
      showToast(t('supervisor.evaluationSaved') || 'تم حفظ التقييم بنجاح', 'success')
      setScore('')
      setComments('')
      onSuccess?.()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t('supervisor.evaluationError') || 'فشل حفظ التقييم'
      setError(errorMsg)
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="score">{t('supervisor.score') || 'الدرجة'} *</Label>
              <Input
                id="score"
                type="number"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                min="0"
                max={maxScore}
                required
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxScore">{t('supervisor.maxScore') || 'الدرجة الكاملة'} *</Label>
              <Input
                id="maxScore"
                type="number"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                min="0"
                required
                placeholder="100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">{t('supervisor.comments') || 'ملاحظات'} ({t('common.optional') || 'اختياري'})</Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
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

