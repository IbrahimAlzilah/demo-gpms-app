import type { Project } from '@/types/project.types'

export interface SupervisionRequestsListState {
  selectedRequest: Project | null
  showConfirmDialog: boolean
  action: 'approve' | 'reject' | null
  comments: string
}

export interface SupervisionRequestsListData {
  requests: Project[]
  isLoading: boolean
  error: Error | null
  currentProjectCount: number
  maxProjectsPerSupervisor: number
}

export type { Project }
