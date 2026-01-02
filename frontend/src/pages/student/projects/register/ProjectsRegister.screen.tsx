import { ProjectRegistrationForm } from '../components/ProjectRegistrationForm'
import { useProjectsRegister } from './ProjectsRegister.hook'
import type { Project } from '@/types/project.types'

interface ProjectsRegisterProps {
  project: Project
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  onCancel?: () => void
}

export function ProjectsRegister({
  project,
  open,
  onClose,
  onSuccess,
  onCancel,
}: ProjectsRegisterProps) {
  const {
    registration,
    registrationLoading,
    periodLoading,
    isPeriodActive,
    error,
    success,
    registerProject,
    cancelRegistration,
    handleSubmit,
    handleCancelRegistration,
    setError,
  } = useProjectsRegister(project)

  const handleSuccess = () => {
    onSuccess?.()
  }

  // Pass all necessary props to ProjectRegistrationForm
  // We need to adapt the hook's return values to match what ProjectRegistrationForm expects
  // Since ProjectRegistrationForm has its own logic, we'll use it directly but could refactor later
  return (
    <ProjectRegistrationForm
      project={project}
      onSuccess={handleSuccess}
      onCancel={onCancel || onClose}
    />
  )
}
