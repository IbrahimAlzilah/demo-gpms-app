import { useQuery } from '@tanstack/react-query'
import { mockPeriodService } from '../lib/mock/period.mock'
import type { PeriodType } from '../types/period.types'

export function usePeriodCheck(type: PeriodType) {
  const { data: isActive, isLoading } = useQuery({
    queryKey: ['periods', type, 'check'],
    queryFn: () => mockPeriodService.isPeriodActive(type),
    staleTime: 60000, // Cache for 1 minute
  })

  return {
    isPeriodActive: isActive ?? false,
    isLoading,
  }
}

