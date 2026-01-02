import type { Request } from '@/types/request.types'

export interface RequestsListState {
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
