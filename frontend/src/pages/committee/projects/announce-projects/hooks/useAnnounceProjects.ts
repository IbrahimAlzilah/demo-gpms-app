import { useQuery } from '@tanstack/react-query'
import { committeeProjectService } from '../api/project.service'

/**
 * Fetch approved/draft projects for announcement
 */
export function useAnnounceProjects() {
  return useQuery({
    queryKey: ['committee-projects', 'draft'],
    queryFn: () => committeeProjectService.getDraft(),
  })
}
