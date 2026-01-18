import type { Grade } from '@/types/evaluation.types'

export interface GradesListData {
  grades: Grade[] | undefined
  isLoading: boolean
  error: Error | null
}

export type { Grade }
