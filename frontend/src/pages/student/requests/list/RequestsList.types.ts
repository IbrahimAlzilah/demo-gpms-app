import type { Request, RequestStatus } from '@/types/request.types'
import type { RequestStatistics } from '../types/Requests.types'

export type RequestStatusFilter = RequestStatus | 'all'

export interface RequestsListState {
  statusFilter: RequestStatusFilter
  selectedRequest: Request | null
  showForm: boolean
  requestToCancel: Request | null
  showCancelDialog: boolean
  requestToEdit: Request | null
  showEditForm: boolean
  requestToDelete: Request | null
  showDeleteDialog: boolean
}

export interface RequestsListData {
  requests: Request[]
  statistics: RequestStatistics
  isLoading: boolean
  error: Error | null
}

export type { Request, RequestStatistics }
