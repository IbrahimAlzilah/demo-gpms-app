import type { Request } from '@/types/request.types'
import type { RequestStatistics } from '../types/Requests.types'

export interface RequestsListState {
  selectedRequest: Request | null
  showForm: boolean
  requestToCancel: Request | null
  showCancelDialog: boolean
}

export interface RequestsListData {
  requests: Request[]
  statistics: RequestStatistics
  isLoading: boolean
  error: Error | null
}

export type { Request, RequestStatistics }
