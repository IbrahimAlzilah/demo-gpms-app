import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { requestService } from '../api/request.service'
import { useAuthStore } from '@/features/auth/store/auth.store'
import type { Request } from '@/types/request.types'

export function useRequests() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['requests', user?.id],
    queryFn: () => {
      if (!user) throw new Error('User not authenticated')
      return requestService.getAll(user.id)
    },
    enabled: !!user,
  })
}

export function useRequest(id: string) {
  return useQuery({
    queryKey: ['requests', id],
    queryFn: () => requestService.getById(id),
    enabled: !!id,
  })
}

export function useCreateRequest() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: (
      data: Omit<Request, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'studentId'>
    ) => {
      if (!user) throw new Error('User not authenticated')
      return requestService.create({
        ...data,
        studentId: user.id,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      queryClient.invalidateQueries({ queryKey: ['student-requests-table'] })
    },
  })
}

export function useCancelRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => requestService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      queryClient.invalidateQueries({ queryKey: ['student-requests-table'] })
    },
  })
}
