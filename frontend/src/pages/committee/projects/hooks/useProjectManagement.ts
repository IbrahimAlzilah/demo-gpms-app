import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { committeeProjectService, type UpdateProjectPayload } from '../announce-projects/api/project.service'
import type { ProjectStatus } from '../../../../types/project.types'

// Query keys
export const projectCommitteeQueryKeys = {
  all: ['committee-projects'] as const,
  statistics: ['committee-projects', 'statistics'] as const,
  workflow: (projectId: string) => ['committee-projects', 'workflow', projectId] as const,
  detail: (projectId: string) => ['committee-projects', 'detail', projectId] as const,
}

/**
 * Hook to fetch comprehensive project statistics
 */
export function useProjectStatistics() {
  return useQuery({
    queryKey: projectCommitteeQueryKeys.statistics,
    queryFn: () => committeeProjectService.getStatistics(),
  })
}

/**
 * Hook to fetch project workflow phases
 */
export function useProjectWorkflow(projectId: string | null) {
  return useQuery({
    queryKey: projectId ? projectCommitteeQueryKeys.workflow(projectId) : ['disabled'],
    queryFn: () => committeeProjectService.getWorkflow(projectId!),
    enabled: !!projectId,
  })
}

/**
 * Hook to fetch detailed project information
 */
export function useProjectDetail(projectId: string | null) {
  return useQuery({
    queryKey: projectId ? projectCommitteeQueryKeys.detail(projectId) : ['disabled'],
    queryFn: () => committeeProjectService.getById(projectId!),
    enabled: !!projectId,
  })
}

/**
 * Hook to update project details
 */
export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, payload }: { projectId: string; payload: UpdateProjectPayload }) =>
      committeeProjectService.update(projectId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: projectCommitteeQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: projectCommitteeQueryKeys.detail(variables.projectId) })
    },
  })
}

/**
 * Hook to update project status
 */
export function useUpdateProjectStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, status, notifyStudents = true }: { 
      projectId: string
      status: ProjectStatus
      notifyStudents?: boolean 
    }) =>
      committeeProjectService.updateStatus(projectId, { status, notify_students: notifyStudents }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: projectCommitteeQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: projectCommitteeQueryKeys.detail(variables.projectId) })
      queryClient.invalidateQueries({ queryKey: projectCommitteeQueryKeys.statistics })
    },
  })
}

/**
 * Hook to delete a project
 */
export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (projectId: string) => committeeProjectService.delete(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectCommitteeQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: projectCommitteeQueryKeys.statistics })
    },
  })
}

/**
 * Hook to announce projects
 */
export function useAnnounceProjects() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (projectIds: string[]) => committeeProjectService.announce(projectIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectCommitteeQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: projectCommitteeQueryKeys.statistics })
    },
  })
}

/**
 * Hook to unannounce projects (revert to draft)
 */
export function useUnannounceProjects() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (projectIds: string[]) => committeeProjectService.unannounce(projectIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectCommitteeQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: projectCommitteeQueryKeys.statistics })
    },
  })
}
