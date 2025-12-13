import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { MainLayout } from '../../app/layouts/MainLayout'
import { EvaluationForm } from '../../features/supervisor/components/EvaluationForm'
import { ClipboardCheck } from 'lucide-react'

export function EvaluationPage() {
  const { t } = useTranslation()
  const { projectId, studentId } = useParams<{ projectId: string; studentId: string }>()
  const defaultProjectId = projectId || '2' // Fallback for development
  const defaultStudentId = studentId || '1' // Fallback for development
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ClipboardCheck className="h-8 w-8 text-primary" />
            {t('nav.evaluation') || 'تقييم المشروع'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('supervisor.evaluationDescription') || 'إدخال درجات وتقييمات الطلاب للمشاريع التي تشرف عليها'}
          </p>
        </div>
        <EvaluationForm projectId={defaultProjectId} studentId={defaultStudentId} />
      </div>
    </MainLayout>
  )
}

