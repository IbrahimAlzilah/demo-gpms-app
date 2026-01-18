import type { ProjectGroup, GroupInvitation } from '@/types/project.types'

/**
 * Group filter options
 */
export interface GroupFilters {
  projectId?: string
  search?: string
}

/**
 * Group list screen props
 */
export interface GroupsListScreenProps {
  // No props needed - uses route context
}

/**
 * Group view screen props
 */
export interface GroupsViewScreenProps {
  groupId: string
  open: boolean
  onClose: () => void
}

export type { ProjectGroup, GroupInvitation }
