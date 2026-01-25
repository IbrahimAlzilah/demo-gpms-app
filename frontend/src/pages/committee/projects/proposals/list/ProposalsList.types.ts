import type { Proposal } from '@/types/project.types'
import type { Submission } from '../types/GroupedSubmissions.types'

export type ProposalStatusFilter = 'all' | 'pending_review' | 'approved' | 'rejected' | 'requires_modification'
export type ViewMode = 'grouped' | 'individual'

export interface ProposalsListState {
  selectedProposal: Proposal | null
  action: 'approve' | 'reject' | 'modify' | null
  statusFilter: ProposalStatusFilter
  proposalToEditId: string | null
  proposalToDelete: Proposal | null
  proposalToViewId: string | null
  viewMode: ViewMode
}

export interface ProposalsListData {
  proposals: Proposal[]
  submissions: Submission[] // Grouped submissions
  isLoading: boolean
  error: Error | null
  pageCount: number
}
