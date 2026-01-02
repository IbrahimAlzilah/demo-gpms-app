import type { Request } from '@/types/request.types'

/**
 * Supervision request filter options
 */
export interface SupervisionRequestFilters {
  status?: Request['status']
  supervisorId?: string
  search?: string
}

/**
 * Supervision request table column definition props
 */
export interface SupervisionRequestTableColumnsProps {
  onApprove: (request: Request) => void
  onReject: (request: Request) => void
  canAcceptMore: boolean
  t: (key: string) => string
}

/**
 * Supervision request list screen props
 */
export interface SupervisionRequestsListScreenProps {
  // No props needed - uses route context
}
