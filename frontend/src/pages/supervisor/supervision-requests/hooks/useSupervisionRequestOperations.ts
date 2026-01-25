import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supervisionService } from '../api/supervision.service'
import { useAuthStore } from '@/pages/auth/login'

export function useApproveSupervisionRequest() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: (requestId: string) => {
      if (!user) throw new Error('User not authenticated')
      return supervisionService.approveRequest(requestId, user.id)
    },
    onSuccess: () => {
      // Invalidate all supervision-requests queries regardless of statusFilter
      queryClient.invalidateQueries({ queryKey: ['supervision-requests'] })
      queryClient.invalidateQueries({ 
        queryKey: ['supervision-requests-table'],
        exact: false // Match all queries that start with this key (including statusFilter variants)
      })
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      // Invalidate dashboard to update project count
      queryClient.invalidateQueries({ queryKey: ['supervisor-dashboard'] })
    },
  })
}

export function useRejectSupervisionRequest() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: ({ requestId, comments }: { requestId: string; comments?: string }) => {
      if (!user) throw new Error('User not authenticated')
      return supervisionService.rejectRequest(requestId, user.id, comments)
    },
    onSuccess: () => {
      // Invalidate all supervision-requests queries regardless of statusFilter
      queryClient.invalidateQueries({ queryKey: ['supervision-requests'] })
      queryClient.invalidateQueries({ 
        queryKey: ['supervision-requests-table'],
        exact: false // Match all queries that start with this key (including statusFilter variants)
      })
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      // Invalidate dashboard to update project count (though reject doesn't change count, keeping for consistency)
      queryClient.invalidateQueries({ queryKey: ['supervisor-dashboard'] })
    },
  })
}
