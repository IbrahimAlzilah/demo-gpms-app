import { useQuery } from '@tanstack/react-query'
import { discussionCommitteeProjectService } from '../api/project.service'

export function useCommitteeProjects(committeeMemberId?: string) {
  return useQuery({
    queryKey: ['discussion-committee-projects', committeeMemberId],
    queryFn: () => discussionCommitteeProjectService.getAssignedProjects(committeeMemberId || ''),
    enabled: !!committeeMemberId,
  })
}

export function useCommitteeProject(id: string) {
  return useQuery({
    queryKey: ['discussion-committee-project', id],
    queryFn: () => discussionCommitteeProjectService.getById(id),
    enabled: !!id,
  })
}
