import type { Grade } from '@/types/evaluation.types'

/**
 * Grade list screen props
 */
export interface GradesListScreenProps {
  // No props needed - uses route context
}

/**
 * Grade view screen props (if needed in the future)
 */
export interface GradesViewScreenProps {
  gradeId: string
  open: boolean
  onClose: () => void
}

export type { Grade }
