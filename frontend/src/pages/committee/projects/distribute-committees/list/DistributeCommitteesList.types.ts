import type { Project } from '@/types/project.types'
import type { CommitteeAssignment } from '../api/committee.service'

export interface DistributeCommitteesListState {
  assignments: Map<string, string[]>
}

export interface DistributeCommitteesListData {
  projects: Project[]
  members: Array<{ id: string; name: string }>
  isLoading: boolean
  error: Error | null
}
