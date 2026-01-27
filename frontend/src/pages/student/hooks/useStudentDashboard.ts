import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/features/dashboard/api/dashboard.service'
import type { StudentDashboardData } from '@/features/dashboard/api/dashboard.service'

export function useStudentDashboard() {
  return useQuery<StudentDashboardData, Error>({
    queryKey: ['student-dashboard'],
    queryFn: () => dashboardService.getStudentDashboard(),
    staleTime: 0,
    refetchOnMount: true,
  })
}
