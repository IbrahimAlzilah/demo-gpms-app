import type { Proposal } from '@/types/project.types'

export type ProposalStatusFilter = 'all' | 'pending_review' | 'approved' | 'rejected' | 'requires_modification'

export interface ProposalsListState {
  selectedProposal: Proposal | null
  action: 'approve' | 'reject' | 'modify' | null
  statusFilter: ProposalStatusFilter
}

export interface ProposalsListData {
  proposals: Proposal[]
  isLoading: boolean
  error: Error | null
  pageCount: number
}
