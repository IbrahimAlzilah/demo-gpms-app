import type { TimePeriod } from '@/types/period.types'
import type { TimePeriodSchema } from '../schema'

export interface PeriodsListState {
  showForm: boolean
  showDeleteDialog: boolean
  selectedPeriod: TimePeriod | null
  success: boolean
  formData: TimePeriodSchema
}

export interface PeriodsListData {
  periods: TimePeriod[]
  isLoading: boolean
  error: Error | null
  pageCount: number
}
