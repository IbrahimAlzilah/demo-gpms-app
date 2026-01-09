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
