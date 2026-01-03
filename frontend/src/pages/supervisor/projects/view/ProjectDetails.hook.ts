import { useSupervisorProject } from '../hooks/useProjects'

export function useProjectDetails(projectId: string) {
  const { data: project, isLoading, error } = useSupervisorProject(projectId)

  return {
    project,
    isLoading,
    error,
  }
}
