import type { Project } from '@/types/project.types'

/**
 * Supervision request filter options
 */
export interface SupervisionRequestFilters {
  status?: Project['supervisorApprovalStatus']
  supervisorId?: string
  search?: string
}

/**
 * Supervision request table column definition props
 */
export interface SupervisionRequestTableColumnsProps {
  onView: (project: Project) => void
  onApprove: (project: Project) => void
  onReject: (project: Project) => void
  canAcceptMore: boolean
  t: (key: string) => string
}

/**
 * Supervision request list screen props
 */
export interface SupervisionRequestsListScreenProps {
  // No props needed - uses route context
}

export interface SupervisorAssignmentRequest {
  id: number
  project_id: number
  supervisor_id: number
  requested_by: number
  responded_by: number | null
  status: 'pending' | 'approved' | 'rejected'
  committee_notes: string | null
  supervisor_response: string | null
  created_at: string
  updated_at: string
  responded_at?: string
  project: {
    id: number
    title: string
    description?: string
  }
  supervisor: {
    id: number
    name: string
    email: string
  }
  requested_by_user?: {
    id: number
    name: string
  }
}
