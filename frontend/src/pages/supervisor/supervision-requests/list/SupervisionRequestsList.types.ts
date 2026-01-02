import type { Request } from '@/types/request.types'

export interface SupervisionRequestsListState {
  selectedRequest: Request | null
  showConfirmDialog: boolean
  action: 'approve' | 'reject' | null
  comments: string
}

export interface SupervisionRequestsListData {
  requests: Request[]
  isLoading: boolean
  error: Error | null
  currentProjectCount: number
  maxProjectsPerSupervisor: number
}

export type { Request }
