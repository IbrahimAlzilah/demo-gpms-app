import { useNavigate } from 'react-router-dom'
import { MainLayout } from '@/layouts/MainLayout'
import { ProjectsList } from './list/ProjectsList.screen'
import { ROUTES } from '@/lib/constants'

export function ProjectsPage() {
  const navigate = useNavigate()
  return (
    <MainLayout>
      <ProjectsList
        onEvaluate={(project) => {
          if (project?.students?.length) {
            navigate(`${ROUTES.SUPERVISOR.EVALUATION}/${project.id}`)
          }
        }}
      />
    </MainLayout>
  )
}
