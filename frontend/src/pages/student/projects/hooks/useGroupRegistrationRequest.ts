import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { GroupRegistrationRequest } from '@/types/project.types'

export function useGroupRegistrationRequest() {
  return useQuery({
    queryKey: ['student-registration-request'],
    queryFn: async () => {
      const response = await apiClient.get<{
        success: boolean
        data: GroupRegistrationRequest | null
        message?: string
      }>('/student/projects/registration-request')
      return response.data.data
    },
    retry: 1,
    staleTime: 0,
    refetchOnMount: true,
  })
}
