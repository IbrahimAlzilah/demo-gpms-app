import type { TimePeriod } from '@/types/period.types'

export interface PeriodsListState {
  showForm: boolean
  showDeleteDialog: boolean
  selectedPeriod: TimePeriod | null
  success: boolean
}

export interface PeriodsListData {
  periods: TimePeriod[]
  isLoading: boolean
  error: Error | null
  pageCount: number
}
