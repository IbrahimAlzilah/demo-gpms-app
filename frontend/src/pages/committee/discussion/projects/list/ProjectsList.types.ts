import type { Project } from '@/types/project.types'

export interface ProjectsListData {
  projects: Project[]
  isLoading: boolean
  error: Error | null
  pageCount: number
}
