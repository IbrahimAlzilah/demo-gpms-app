import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/features/dashboard/api/dashboard.service'
import type { AdminDashboardData } from '@/features/dashboard/api/dashboard.service'

export function useAdminDashboard() {
  return useQuery<AdminDashboardData, Error>({
    queryKey: ['admin-dashboard'],
    queryFn: () => dashboardService.getAdminDashboard(),
    staleTime: 30000, // 30 seconds
  })
}
