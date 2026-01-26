import type { ProjectRegistration, GroupRegistrationRequest } from '@/types/project.types'

export type RegistrationStatusFilter = 'pending' | 'approved' | 'rejected' | 'all'
export type RegistrationViewMode = 'individual' | 'grouped'

export interface RegistrationsListState {
  statusFilter: RegistrationStatusFilter
  selectedRegistration: ProjectRegistration | null
  action: 'approve' | 'reject' | null
  comments: string
  showDialog: boolean
  registrationToViewId: string | null
  viewMode: RegistrationViewMode
  pagination?: {
    pageIndex: number
    pageSize: number
  }
}

export interface RegistrationsListData {
  registrations: ProjectRegistration[]
  isLoading: boolean
  error: Error | null
  pageCount: number
  groupedRequests?: GroupRegistrationRequest[]
  groupedPagination?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}
