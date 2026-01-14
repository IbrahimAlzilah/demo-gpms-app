import { useProject, useProjectRegistration } from '../hooks/useProjects'

export function useProjectsView(projectId: string) {
  const { data: project, isLoading, error } = useProject(projectId)
  const { data: registration, isLoading: registrationLoading } = useProjectRegistration(projectId)

  return {
    project,
    registration,
    isLoading: isLoading || registrationLoading,
    error,
  }
}
