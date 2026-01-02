import type { ProjectRegistration } from '@/types/project.types'

export type RegistrationStatusFilter = 'pending' | 'approved' | 'rejected' | 'all'

export interface RegistrationsListState {
  statusFilter: RegistrationStatusFilter
  selectedRegistration: ProjectRegistration | null
  action: 'approve' | 'reject' | null
  comments: string
  showDialog: boolean
}

export interface RegistrationsListData {
  registrations: ProjectRegistration[]
  isLoading: boolean
  error: Error | null
  pageCount: number
}
