import { mockPeriodService } from '../../../lib/mock/period.mock'
import type { TimePeriod } from '../../../types/period.types'

export const periodService = {
  getAll: async (): Promise<TimePeriod[]> => {
    return mockPeriodService.getAll()
  },

  create: async (
    data: Omit<TimePeriod, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<TimePeriod> => {
    return mockPeriodService.create(data)
  },

  update: async (id: string, data: Partial<TimePeriod>): Promise<TimePeriod> => {
    return mockPeriodService.update(id, data)
  },
}

