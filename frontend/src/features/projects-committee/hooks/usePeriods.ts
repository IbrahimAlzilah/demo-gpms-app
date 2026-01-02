import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { periodService } from '../api/period.service'
import { useAuthStore } from '../../auth/store/auth.store'
import type { TimePeriod } from '../../../types/period.types'

export function usePeriods() {
  return useQuery({
    queryKey: ['periods'],
    queryFn: () => periodService.getAll(),
  })
}

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

