import type { Grade } from '@/types/evaluation.types'

export type GradeApprovalFilter = 'all' | 'pending' | 'approved'

export interface GradesListState {
  approvalFilter: GradeApprovalFilter
  selectedGrade: Grade | null
  action: 'approve' | null
  showDialog: boolean
  gradeToViewId: string | null
}

export interface GradesListData {
  grades: Grade[]
  isLoading: boolean
  error: Error | null
  pageCount: number
}
