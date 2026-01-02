import type { Project } from '@/types/project.types'
import type { User } from '@/types/user.types'
import type { Grade } from '@/types/evaluation.types'

export interface EvaluationListItem {
  project: Project
  student: User
  hasEvaluation: boolean
  evaluation?: Grade
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
