import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { registrationService, type RegistrationListParams } from '../api/registration.service'
import type { ProjectRegistration } from '@/types/project.types'

export function useRegistrations(params?: RegistrationListParams) {
  return useQuery({
    queryKey: ['committee-registrations', params],
    queryFn: () => registrationService.getAll(params),
  })
}

export function useRegistration(id: string) {
  return useQuery({
    queryKey: ['committee-registration', id],
    queryFn: () => registrationService.getById(id),
    enabled: !!id,
  })
}

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
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project-registrations'] })
    },
  })
}

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
      queryClient.invalidateQueries({ queryKey: ['project-registrations'] })
    },
  })
}
