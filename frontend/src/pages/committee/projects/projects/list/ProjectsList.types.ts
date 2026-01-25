import type { Project } from '@/types/project.types'

export interface ProjectsListState {
  projectToViewId: string | null
}

export interface ProjectsListData {
  projects: Project[]
  isLoading: boolean
  error: Error | null
}
