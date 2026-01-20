import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/features/dashboard/api/dashboard.service'
import type { DiscussionCommitteeDashboardData } from '@/features/dashboard/api/dashboard.service'

export function useDiscussionCommitteeDashboard() {
  return useQuery<DiscussionCommitteeDashboardData, Error>({
    queryKey: ['discussion-committee-dashboard'],
    queryFn: () => dashboardService.getDiscussionCommitteeDashboard(),
    staleTime: 30000, // 30 seconds
  })
}
