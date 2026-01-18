import type { Project } from '@/types/project.types'

export interface AnnounceProjectsListState {
  selectedProjects: Set<string>
  viewStatus: 'draft' | 'available_for_registration'
  projectToViewId: string | null
  projectToRemove: Project | null
  showRemoveConfirm: boolean
}

export interface AnnounceProjectsListData {
  projects: Project[]
  isLoading: boolean
  error: Error | null
  pageCount: number
}
