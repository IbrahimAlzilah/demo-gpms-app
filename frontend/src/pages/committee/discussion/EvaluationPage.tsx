import { useParams } from 'react-router-dom'
import { MainLayout } from '@/layouts/MainLayout'
import { FinalEvaluationForm } from './components/FinalEvaluationForm'

export function DiscussionEvaluationPage() {
  const { projectId, studentId } = useParams<{ projectId: string; studentId: string }>()
  const defaultProjectId = projectId || '2' // Fallback for development
  const defaultStudentId = studentId || '1' // Fallback for development

  return (
    <MainLayout>
      <FinalEvaluationForm projectId={defaultProjectId} studentId={defaultStudentId} />
    </MainLayout>
  )
}

