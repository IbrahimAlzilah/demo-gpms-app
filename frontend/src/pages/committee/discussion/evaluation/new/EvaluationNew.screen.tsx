import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FinalEvaluationForm } from '../components/FinalEvaluationForm'
import type { EvaluationNewProps } from './EvaluationNew.types'

export function EvaluationNew({ projectId, studentId, onSuccess }: EvaluationNewProps) {
  const { t } = useTranslation()


  return (
    <FinalEvaluationForm
      projectId={projectId}
      studentId={studentId}
      onSuccess={() => {
        toast.success(t('discussion.evaluationSaved'))
        onSuccess?.()
      }}
    />
  )
}
