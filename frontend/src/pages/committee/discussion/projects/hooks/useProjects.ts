import { useQuery } from '@tanstack/react-query'
import { discussionCommitteeProjectService } from '../api/project.service'

/**
 * Fetch committee projects
 */
export function useProjects(committeeMemberId?: string) {
  return useQuery({
    queryKey: ['discussion-committee-projects', committeeMemberId],
    queryFn: () => discussionCommitteeProjectService.getAssignedProjects(committeeMemberId || ''),
    enabled: !!committeeMemberId,
  })
}

/**
 * Fetch a single committee project by ID
 */
export function useProject(id: string) {
  return useQuery({
    queryKey: ['discussion-committee-project', id],
    queryFn: () => discussionCommitteeProjectService.getById(id),
    enabled: !!id,
  })
}
