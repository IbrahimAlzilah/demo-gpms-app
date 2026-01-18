import { useMutation, useQueryClient } from '@tanstack/react-query'
import { committeeRequestService } from '../api/request.service'
import { useAuthStore } from '@/pages/auth/login'

/**
 * Hook for approving a request
 */
export function useApproveRequest() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: ({ id, comments }: { id: string; comments?: string }) => {
      if (!user) throw new Error('User not authenticated')
      return committeeRequestService.approve(id, user.id, comments)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['committee-requests'] })
      queryClient.invalidateQueries({ queryKey: ['committee-requests-table'] })
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      queryClient.invalidateQueries({ queryKey: ['student-requests-table'] })
    },
  })
}

/**
 * Hook for rejecting a request
 */
export function useRejectRequest() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: ({ id, comments }: { id: string; comments?: string }) => {
      if (!user) throw new Error('User not authenticated')
      return committeeRequestService.reject(id, user.id, comments)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['committee-requests'] })
      queryClient.invalidateQueries({ queryKey: ['committee-requests-table'] })
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      queryClient.invalidateQueries({ queryKey: ['student-requests-table'] })
    },
  })
}
