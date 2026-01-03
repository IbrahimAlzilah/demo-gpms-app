import { useQuery } from '@tanstack/react-query'
import { committeeRequestService } from '../api/request.service'

/**
 * Fetch pending requests
 */
export function usePendingRequests() {
  return useQuery({
    queryKey: ['committee-requests', 'pending'],
    queryFn: () => committeeRequestService.getPendingRequests(),
  })
}

/**
 * Fetch a single request by ID
 */
export function useRequest(id: string) {
  return useQuery({
    queryKey: ['committee-requests', id],
    queryFn: () => committeeRequestService.getById(id),
    enabled: !!id,
  })
}
