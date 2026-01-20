import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/features/dashboard/api/dashboard.service'
import type { SupervisorDashboardData } from '@/features/dashboard/api/dashboard.service'

export function useSupervisorDashboard() {
  return useQuery<SupervisorDashboardData, Error>({
    queryKey: ['supervisor-dashboard'],
    queryFn: () => dashboardService.getSupervisorDashboard(),
    staleTime: 30000, // 30 seconds
  })
}
