import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { MainLayout } from '../../../app/layouts/MainLayout'
import { FinalEvaluationForm } from '../../../features/discussion-committee/components/FinalEvaluationForm'
import { Award } from 'lucide-react'

export function DiscussionEvaluationPage() {
  const { t } = useTranslation()
  const { projectId, studentId } = useParams<{ projectId: string; studentId: string }>()
  const defaultProjectId = projectId || '2' // Fallback for development
  const defaultStudentId = studentId || '1' // Fallback for development
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Award className="h-8 w-8 text-primary" />
            {t('nav.finalEvaluation') || 'تقييم المناقشة النهائية'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('discussion.evaluationDescription') || 'تقييم المشروع ووضع الدرجات النهائية بعد المناقشة'}
          </p>
        </div>
        <FinalEvaluationForm projectId={defaultProjectId} studentId={defaultStudentId} />
      </div>
    </MainLayout>
  )
}

