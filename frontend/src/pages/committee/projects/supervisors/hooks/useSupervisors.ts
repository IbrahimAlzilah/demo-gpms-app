import { useQuery } from '@tanstack/react-query'
import { supervisorAssignmentService } from '../api/supervisor.service'

/**
 * Fetch projects without supervisor
 */
export function useProjectsWithoutSupervisor() {
  return useQuery({
    queryKey: ['projects-without-supervisor'],
    queryFn: () => supervisorAssignmentService.getProjectsWithoutSupervisor(),
  })
}

/**
 * Fetch available supervisors
 */
export function useAvailableSupervisors() {
  return useQuery({
    queryKey: ['available-supervisors'],
    queryFn: () => supervisorAssignmentService.getAvailableSupervisors(),
  })
}
