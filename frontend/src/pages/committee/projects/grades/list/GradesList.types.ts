import type { Grade } from '@/types/evaluation.types'

export type GradeApprovalFilter = 'all' | 'pending' | 'approved'

export interface GradesListState {
  approvalFilter: 'pending' | 'approved' | 'all'
  selectedGrade: Grade | null
  action: 'approve' | 'edit' | 'view' | null
  showDialog: boolean
  gradeToViewId: string | null
}

export interface GradesListData {
  grades: Grade[]
  isLoading: boolean
  error: Error | null
  pageCount: number
}
