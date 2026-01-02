import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Textarea } from '@/components/ui'
import { LoadingSpinner, useToast } from '@/components/common'
import { AlertCircle, Loader2 } from 'lucide-react'
import { FinalEvaluationForm } from '../components/FinalEvaluationForm'
import type { EvaluationNewProps } from './EvaluationNew.types'

export function EvaluationNew({ projectId, studentId, onSuccess }: EvaluationNewProps) {
  const { t } = useTranslation()
  const { showToast } = useToast()

  return (
    <FinalEvaluationForm
      projectId={projectId}
      studentId={studentId}
      onSuccess={() => {
        showToast(t('discussion.evaluationSaved'), 'success')
        onSuccess?.()
      }}
    />
  )
}
