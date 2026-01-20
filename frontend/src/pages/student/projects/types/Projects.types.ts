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
  onSelectProject?: (project: Project) => void
  onViewRejection?: (project: Project, registration: any) => void
  t: (key: string) => string
  registrationMap?: Map<string, any>
  studentGroup?: any
  groupLoading?: boolean
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
  onRegister?: (project: Project) => void
}

/**
 * Project register screen props
 */
export interface ProjectsRegisterScreenProps {
  project: Project
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  onCancel?: () => void
}
