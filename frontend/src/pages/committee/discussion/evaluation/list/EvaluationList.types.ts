import type { Project } from '@/types/project.types'
import type { User } from '@/types/user.types'

export interface EvaluationListItem {
  project: Project
  student: User
  hasEvaluation: boolean
  isLocked?: boolean
  evaluation?: {
    id: string
    score: number | null
    maxScore: number | null
    supervisorScore?: number | null
    supervisorMaxScore?: number | null
    finalGrade?: number | null
    isApproved: boolean
    comments?: string | null
  }
}

export interface EvaluationListState {
  selectedProjectId: string | null
  selectedStudentId: string | null
  showEvaluationForm: boolean
}

export interface EvaluationListData {
  items: EvaluationListItem[]
  isLoading: boolean
  error: Error | null
  pageCount: number
}
