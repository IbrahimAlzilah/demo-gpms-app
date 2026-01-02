import { useQuery } from '@tanstack/react-query'
import { projectService } from '@/features/student/api/project.service'
import type { Project } from '@/types/project.types'

/**
 * Fetch all projects
 */
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => projectService.getAll(),
  })
}

/**
 * Fetch available projects for registration
 */
export function useAvailableProjects() {
  return useQuery({
    queryKey: ['projects', 'available'],
    queryFn: () => projectService.getAvailable(),
  })
}

/**
 * Fetch a single project by ID
 */
export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectService.getById(id),
    enabled: !!id,
  })
}
