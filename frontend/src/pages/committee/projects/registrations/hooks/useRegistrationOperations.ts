import { useMutation, useQueryClient } from '@tanstack/react-query'
import { registrationService } from '../api/registration.service'

/**
 * Hook for approving a registration
 */
export function useApproveRegistration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      registrationId,
      comments,
    }: {
      registrationId: string
      comments?: string
    }) => registrationService.approve(registrationId, { comments }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['committee-registrations'] })
      queryClient.invalidateQueries({ queryKey: ['committee-registrations-table'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project-registrations'] })
    },
  })
}

/**
 * Hook for rejecting a registration
 */
export function useRejectRegistration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      registrationId,
      comments,
    }: {
      registrationId: string
      comments: string
    }) => registrationService.reject(registrationId, { comments }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['committee-registrations'] })
      queryClient.invalidateQueries({ queryKey: ['committee-registrations-table'] })
      queryClient.invalidateQueries({ queryKey: ['project-registrations'] })
    },
  })
}
