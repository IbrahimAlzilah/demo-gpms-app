import type { Request, RequestStatus } from '@/types/request.types'

export type RequestStatusFilter = RequestStatus | 'all'

export interface RequestsListState {
  statusFilter: RequestStatusFilter
  selectedRequest: Request | null
  action: 'approve' | 'reject' | null
  showConfirmDialog: boolean
  comments: string
}

export interface RequestsListData {
  requests: Request[]
  isLoading: boolean
  error: Error | null
  pageCount: number
}
