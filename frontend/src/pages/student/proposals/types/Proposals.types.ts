import type { Proposal } from '@/types/project.types'

/**
 * Extended proposal type for form operations
 */
export interface ProposalFormData {
  title: string
  description: string
  objectives: string
  methodology?: string
  expectedOutcomes?: string
}

/**
 * Proposal filter options
 */
export interface ProposalFilters {
  submitterId?: string
  status?: Proposal['status']
  search?: string
}

/**
 * Proposal table column definition props
 */
export interface ProposalTableColumnsProps {
  onView: (proposal: Proposal) => void
  onEdit?: (proposal: Proposal) => void
  t: (key: string) => string
}

/**
 * Proposal statistics
 */
export interface ProposalStatistics {
  total: number
  pending: number
  approved: number
  rejected: number
}

/**
 * Proposal list screen props
 */
export interface ProposalsListScreenProps {
  // No props needed - uses route context
}

/**
 * Proposal view screen props
 */
export interface ProposalsViewScreenProps {
  proposalId: string
  onClose: () => void
}

/**
 * Proposal edit screen props
 */
export interface ProposalsEditScreenProps {
  proposalId: string
  onClose: () => void
  onSuccess?: () => void
}

/**
 * Proposal new screen props
 */
export interface ProposalsNewScreenProps {
  onClose: () => void
  onSuccess?: () => void
}
