import { useParams } from 'react-router-dom'
import { MainLayout } from '@/layouts/MainLayout'
import { EvaluationForm } from '@/features/supervisor/components/EvaluationForm'

export function EvaluationPage() {
  const { projectId, studentId } = useParams<{ projectId: string; studentId: string }>()
  const defaultProjectId = projectId || '2' // Fallback for development
  const defaultStudentId = studentId || '1' // Fallback for development

  return (
    <MainLayout>
      <EvaluationForm projectId={defaultProjectId} studentId={defaultStudentId} />
    </MainLayout>
  )
}

