import { useMutation, useQueryClient } from '@tanstack/react-query'
import { periodService } from '../api/period.service'
import { useAuthStore } from '@/pages/auth/login'
import type { TimePeriod } from '@/types/period.types'

/**
 * Hook for creating a new period
 */
export function useCreatePeriod() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: (
      data: Omit<TimePeriod, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>
    ) => {
      if (!user) throw new Error('User not authenticated')
      return periodService.create({
        ...data,
        createdBy: user.id,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periods'] })
      queryClient.invalidateQueries({ queryKey: ['committee-periods-table'] })
    },
  })
}

/**
 * Hook for updating an existing period
 */
export function useUpdatePeriod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TimePeriod> }) =>
      periodService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['periods'] })
      queryClient.invalidateQueries({ queryKey: ['committee-periods-table'] })
      queryClient.invalidateQueries({ queryKey: ['periods', variables.id] })
    },
  })
}

/**
 * Hook for deleting a period
 */
export function useDeletePeriod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => periodService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periods'] })
      queryClient.invalidateQueries({ queryKey: ['committee-periods-table'] })
    },
  })
}
