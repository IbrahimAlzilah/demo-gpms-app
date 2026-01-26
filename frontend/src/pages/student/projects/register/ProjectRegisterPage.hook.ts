import { useParams, useNavigate } from 'react-router-dom'
import { useProject } from '../hooks/useProjects'
import { useMyGroup } from '@/pages/student/groups/hooks/useGroups'
import { useStudentRegistrations } from '../hooks/useProjects'
import { usePeriodCheck } from '@/hooks/usePeriodCheck'
import { ROUTES } from '@/lib/constants'

export function useProjectRegisterPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const {
    data: project,
    isLoading: projectLoading,
    error: projectError,
  } = useProject(projectId || '')

  const {
    data: studentGroup,
    isLoading: groupLoading,
    error: groupError,
  } = useMyGroup()

  const {
    data: allRegistrations,
    isLoading: registrationsLoading,
  } = useStudentRegistrations()

  const {
    isPeriodActive,
    isLoading: periodLoading,
  } = usePeriodCheck('project_registration')

  const handleBack = () => {
    navigate(ROUTES.STUDENT.PROJECTS)
  }

  const handleSuccess = () => {
    // Navigate back to projects list after successful registration
    navigate(ROUTES.STUDENT.PROJECTS)
  }

  return {
    projectId: projectId || '',
    project,
    studentGroup,
    allRegistrations,
    isPeriodActive,
    isLoading: projectLoading || groupLoading || registrationsLoading || periodLoading,
    error: projectError || groupError,
    handleBack,
    handleSuccess,
  }
}
