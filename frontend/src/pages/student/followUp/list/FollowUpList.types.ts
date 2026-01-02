import type { Project } from '@/types/project.types'

export interface FollowUpListState {
  // Currently no state needed, but follows the pattern for future extensibility
}

export interface FollowUpListData {
  project: Project | null
  isLoading: boolean
  error: Error | null
}

export type { Project }
