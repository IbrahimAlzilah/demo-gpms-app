import { useProject } from '../hooks/useProjects'

export function useProjectsView(projectId: string) {
  const { data: project, isLoading, error } = useProject(projectId)

  return {
    project,
    isLoading,
    error,
  }
}
