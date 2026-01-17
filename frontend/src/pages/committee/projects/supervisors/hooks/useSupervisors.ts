import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { supervisorAssignmentService } from '../api/supervisor.service'

/**
 * Fetch projects without supervisor
 */
export function useProjectsWithoutSupervisor() {
  return useInfiniteQuery({
    queryKey: ['projects-without-supervisor'],
    queryFn: ({ pageParam = 1 }) => supervisorAssignmentService.getProjectsWithoutSupervisor(pageParam as number),
    getNextPageParam: (lastPage) => {
      // API returns meta.page and meta.totalPages
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1
      }
      return undefined
    },
    initialPageParam: 1,
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
