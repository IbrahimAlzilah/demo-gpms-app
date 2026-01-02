import type { Project } from '@/types/project.types'

export interface SupervisorsListState {
  selectedProject: Project | null
  selectedSupervisor: string
}

export interface SupervisorsListData {
  projects: Project[]
  supervisors: Array<{ id: string; name: string }>
  isLoading: boolean
  error: Error | null
}
