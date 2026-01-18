import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../lib/axios'
import type { PeriodType } from '../types/period.types'

// Response structure after axios interceptor extracts data
interface WindowCheckResponse {
  type: string
  isActive: boolean
  window: any | null
  daysRemaining: number | null
}

async function checkPeriodActive(type: PeriodType): Promise<boolean> {
  try {
    const response = await apiClient.post<WindowCheckResponse>('/time-windows/check', { type })
    // Axios interceptor already extracts data.data to data, so access directly
    return response.data?.isActive ?? false
  } catch (error) {
    console.error('Error checking period status:', error)
    return false
  }
}

export function usePeriodCheck(type: PeriodType) {
  const { data: isActive, isLoading } = useQuery({
    queryKey: ['periods', type, 'check'],
    queryFn: () => checkPeriodActive(type),
    staleTime: 60000, // Cache for 1 minute
  })

  return {
    isPeriodActive: isActive ?? false,
    isLoading,
  }
}

