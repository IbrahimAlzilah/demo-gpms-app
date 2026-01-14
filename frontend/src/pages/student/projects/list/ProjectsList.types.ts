import type { Project, ProjectRegistration } from '@/types/project.types'

export interface ProjectsListState {
  selectedProject: Project | null
  showRegistrationForm: boolean
  showDetails: boolean
  rejectionRegistration: ProjectRegistration | null
  showRejectionDetails: boolean
}

export interface ProjectsListData {
  projects: Project[]
  isLoading: boolean
  error: Error | null
}

export type { Project }
