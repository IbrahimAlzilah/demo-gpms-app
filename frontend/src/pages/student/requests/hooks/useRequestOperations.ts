import { useMutation, useQueryClient } from '@tanstack/react-query'
import { requestService } from '../api/request.service'
import { useAuthStore } from '@/pages/auth/login'
import type { Request } from '@/types/request.types'

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

export function useUpdateRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Request, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'studentId'>> }) =>
      requestService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      queryClient.invalidateQueries({ queryKey: ['student-requests-table'] })
    },
  })
}

export function useDeleteRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => requestService.delete(id),
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
