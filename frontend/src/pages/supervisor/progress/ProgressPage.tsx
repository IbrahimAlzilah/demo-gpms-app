import { useParams, useNavigate } from 'react-router-dom'
import { MainLayout } from '@/layouts/MainLayout'
import { ProgressList } from './list/ProgressList.screen'
import { ProjectsList } from '../projects/list/ProjectsList.screen'
import { ROUTES } from '@/lib/constants'

export function ProgressPage() {
  const { projectId } = useParams<{ projectId?: string }>()
  const navigate = useNavigate()

  // If projectId is provided, show progress for that project
  if (projectId) {
    return (
      <MainLayout>
        <ProgressList projectId={projectId} />
      </MainLayout>
    )
  }

  // Otherwise, show projects list with ability to select a project
  return (
    <MainLayout>
      <ProjectsList onProjectSelect={(project) => {
        navigate(`${ROUTES.SUPERVISOR.PROGRESS}/${project.id}`)
      }} />
    </MainLayout>
  )
}
