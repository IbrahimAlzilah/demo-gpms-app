import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supervisionService } from '../api/supervision.service'
import { useAuthStore } from '../../auth/store/auth.store'

export function useSupervisionRequests() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['supervision-requests', user?.id],
    queryFn: () => {
      if (!user) throw new Error('User not authenticated')
      return supervisionService.getRequests(user.id)
    },
    enabled: !!user,
  })
}

export function useApproveSupervisionRequest() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: (requestId: string) => {
      if (!user) throw new Error('User not authenticated')
      return supervisionService.approveRequest(requestId, user.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supervision-requests'] })
      queryClient.invalidateQueries({ queryKey: ['supervision-requests-table'] })
      queryClient.invalidateQueries({ queryKey: ['requests'] })
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
      queryClient.invalidateQueries({ queryKey: ['supervision-requests'] })
      queryClient.invalidateQueries({ queryKey: ['supervision-requests-table'] })
      queryClient.invalidateQueries({ queryKey: ['requests'] })
    },
  })
}

