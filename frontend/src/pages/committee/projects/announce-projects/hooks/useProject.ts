import { useQuery } from '@tanstack/react-query'
import { committeeProjectService } from '../api/project.service'

/**
 * Fetch a single project by ID
 */
export function useProject(id: string) {
  return useQuery({
    queryKey: ['committee-projects', id],
    queryFn: () => committeeProjectService.getById(id),
    enabled: !!id,
  })
}
