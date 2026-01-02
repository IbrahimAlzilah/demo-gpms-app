import type { Project } from '@/types/project.types'

/**
 * Project filter options
 */
export interface ProjectFilters {
  status?: Project['status']
  supervisorId?: string
  search?: string
}

/**
 * Project table column definition props
 */
export interface ProjectTableColumnsProps {
  t: (key: string) => string
}

/**
 * Project list screen props
 */
export interface ProjectsListScreenProps {
  // No props needed - uses route context
}

/**
 * Project view screen props
 */
export interface ProjectsViewScreenProps {
  projectId: string
  open: boolean
  onClose: () => void
}
