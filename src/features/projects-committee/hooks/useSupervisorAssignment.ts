import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supervisorAssignmentService } from '../api/supervisor.service'

export function useProjectsWithoutSupervisor() {
  return useQuery({
    queryKey: ['projects-without-supervisor'],
    queryFn: () => supervisorAssignmentService.getProjectsWithoutSupervisor(),
  })
}

export function useAvailableSupervisors() {
  return useQuery({
    queryKey: ['available-supervisors'],
    queryFn: () => supervisorAssignmentService.getAvailableSupervisors(),
  })
}

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

