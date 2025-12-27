import { useParams } from 'react-router-dom'
import { MainLayout } from '@/layouts/MainLayout'
import { ProjectProgressTracker } from '@/features/supervisor/components/ProjectProgressTracker'

export function ProgressPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const defaultProjectId = projectId || '2' // Fallback for development

  return (
    <MainLayout>
      <ProjectProgressTracker projectId={defaultProjectId} />
    </MainLayout>
  )
}

