import { useQuery, useQueries } from '@tanstack/react-query'
import { discussionCommitteeProjectService } from '../../projects/api/project.service'
import { committeeEvaluationService } from '../api/evaluation.service'
import type { Grade } from '@/types/evaluation.types'
import type { Project } from '@/types/project.types'

/**
 * Fetch evaluations by project ID
 */
export function useEvaluationsByProject(projectId: string) {
  return useQuery({
    queryKey: ['discussion-committee-evaluations', projectId],
    queryFn: () => committeeEvaluationService.getEvaluationsByProject(projectId),
    enabled: !!projectId,
  })
}

/**
 * Fetch evaluation projects for a committee member
 */
export function useEvaluationProjects(committeeMemberId?: string) {
  return useQuery({
    queryKey: ['discussion-committee-evaluation-projects', committeeMemberId],
    queryFn: () => discussionCommitteeProjectService.getAssignedProjects(committeeMemberId || ''),
    enabled: !!committeeMemberId,
  })
}

/**
 * Fetch evaluations for multiple projects
 */
export function useEvaluationsForProjects(projects: Project[] | undefined) {
  return useQueries({
    queries:
      projects?.map((project) => ({
        queryKey: ['discussion-committee-evaluations', project.id],
        queryFn: () => committeeEvaluationService.getEvaluationsByProject(project.id),
        enabled: !!project.id,
      })) || [],
  })
}
