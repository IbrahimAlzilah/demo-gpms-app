import { useRequest } from '../hooks/useRequests'

export function useRequestsView(requestId: string) {
  const { data: request, isLoading, error } = useRequest(requestId)

  return {
    request: request || null,
    isLoading,
    error: error as Error | null,
  }
}
