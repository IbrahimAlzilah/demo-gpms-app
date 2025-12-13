import { v4 as uuidv4 } from 'uuid'
import type { TimePeriod, PeriodType } from '../../types/period.types'

// Mock time periods database
export const mockTimePeriods: TimePeriod[] = [
  {
    id: '1',
    name: 'فترة تقديم المقترحات',
    type: 'proposal_submission',
    startDate: new Date('2024-01-01').toISOString(),
    endDate: new Date('2024-02-01').toISOString(),
    isActive: true,
    academicYear: '2023-2024',
    semester: 'Fall',
    description: 'فترة تقديم مقترحات مشاريع التخرج',
    createdBy: '3',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const mockPeriodService = {
  getAll: async (): Promise<TimePeriod[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return [...mockTimePeriods]
  },

  getById: async (id: string): Promise<TimePeriod | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockTimePeriods.find((p) => p.id === id) || null
  },

  getByType: async (type: PeriodType): Promise<TimePeriod | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return (
      mockTimePeriods.find(
        (p) => p.type === type && p.isActive
      ) || null
    )
  },

  create: async (
    data: Omit<TimePeriod, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<TimePeriod> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const period: TimePeriod = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockTimePeriods.push(period)
    return period
  },

  update: async (id: string, data: Partial<TimePeriod>): Promise<TimePeriod> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const index = mockTimePeriods.findIndex((p) => p.id === id)
    if (index === -1) throw new Error('Period not found')
    mockTimePeriods[index] = {
      ...mockTimePeriods[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    return mockTimePeriods[index]
  },

  delete: async (id: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const index = mockTimePeriods.findIndex((p) => p.id === id)
    if (index === -1) throw new Error('Period not found')
    mockTimePeriods.splice(index, 1)
  },

  isPeriodActive: async (type: PeriodType): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 100))
    const period = mockTimePeriods.find((p) => p.type === type && p.isActive)
    if (!period) return false
    const now = new Date()
    const start = new Date(period.startDate)
    const end = new Date(period.endDate)
    return now >= start && now <= end
  },
}

