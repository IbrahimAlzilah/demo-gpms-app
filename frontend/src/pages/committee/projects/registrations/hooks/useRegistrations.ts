import { useQuery } from '@tanstack/react-query'
import { registrationService, type RegistrationListParams } from '../api/registration.service'

/**
 * Fetch all registrations
 */
export function useRegistrations(params?: RegistrationListParams) {
  return useQuery({
    queryKey: ['committee-registrations', params],
    queryFn: () => registrationService.getAll(params),
  })
}

/**
 * Fetch a single registration by ID
 */
export function useRegistration(id: string) {
  return useQuery({
    queryKey: ['committee-registration', id],
    queryFn: () => registrationService.getById(id),
    enabled: !!id,
  })
}
