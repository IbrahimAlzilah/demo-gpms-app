import type { Project } from '@/types/project.types'
import type { User } from '@/types/user.types'

export interface EvaluationListItem {
  project: Project & {
    supervisor?: {
      id: string | number
      firstName?: string | null
      lastName?: string | null
      name: string
    }
  }
  student: User
  hasEvaluation: boolean
  isLocked?: boolean
  evaluation?: {
    id: string | number
    score: number | null
    maxScore: number | null
    supervisorScore?: number | null
    supervisorMaxScore?: number | null
    finalGrade?: string | number | null
    isApproved: boolean
    comments?: string | null
  }
}

export interface EvaluationListState {
  selectedProjectId: string | null
  selectedStudentId: string | null
  showEvaluationForm: boolean
  defenseStage: 'fd1' | 'fd2'
}

export interface EvaluationListData {
  items: EvaluationListItem[]
  isLoading: boolean
  error: Error | null
  pageCount: number
}
