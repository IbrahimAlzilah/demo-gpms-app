import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supervisorAssignmentService } from '../api/supervisor.service'

/**
 * Hook for assigning a supervisor to a project
 */
export function useAssignSupervisor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, supervisorId }: { projectId: string; supervisorId: string }) =>
      supervisorAssignmentService.assignSupervisor(projectId, supervisorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects-without-supervisor'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['available-supervisors'] })
    },
  })
}
