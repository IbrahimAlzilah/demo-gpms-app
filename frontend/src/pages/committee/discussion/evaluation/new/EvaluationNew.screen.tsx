// import { useTranslation } from 'react-i18next'
import { useToast } from '@/components/common'
import { FinalEvaluationForm } from '../components/FinalEvaluationForm'
import type { EvaluationNewProps } from './EvaluationNew.types'

export function EvaluationNew({ projectId, studentId, onSuccess }: EvaluationNewProps) {
  // const { t } = useTranslation()
  const { success } = useToast()

  return (
    <FinalEvaluationForm
      projectId={projectId}
      studentId={studentId}
      onSuccess={() => {
        success('discussion.evaluationSaved')
        onSuccess?.()
      }}
    />
  )
}
