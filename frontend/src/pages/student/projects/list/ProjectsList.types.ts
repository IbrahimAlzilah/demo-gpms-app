import type { Project } from '@/types/project.types'

export interface ProjectsListState {
  selectedProject: Project | null
  showRegistrationForm: boolean
  showDetails: boolean
}

export interface ProjectsListData {
  projects: Project[]
  isLoading: boolean
  error: Error | null
}

export type { Project }
