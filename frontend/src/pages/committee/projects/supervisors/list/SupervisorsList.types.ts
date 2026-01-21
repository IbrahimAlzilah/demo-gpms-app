import type { User } from '@/types/user.types'
import type { Project } from '@/types/project.types'

export interface SupervisorsListState {
  selectedProject: Project | null
  selectedSupervisor: string
}

export interface SupervisorsListData {
  projects: Project[]
  supervisors: User[]
  isLoading: boolean
  error: Error | null
}
