import type { Project } from '@/types/project.types'

export type SupervisionRequestStatusFilter = 'pending' | 'approved' | 'rejected' | 'all'

export interface SupervisionRequestsListState {
  statusFilter: SupervisionRequestStatusFilter
  selectedRequest: Project | null
  showConfirmDialog: boolean
  action: 'approve' | 'reject' | null
  comments: string
  viewingRequest: Project | null
}

export interface SupervisionRequestsListData {
  requests: Project[]
  isLoading: boolean
  error: Error | null
  currentProjectCount: number
  maxProjectsPerSupervisor: number
}

export type { Project }
