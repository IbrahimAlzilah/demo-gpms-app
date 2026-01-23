import type { Proposal, ProposalSubmission } from '@/types/project.types'

export type ProposalStatusFilter = 'all' | 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'requires_modification'

export interface ProposalsListState {
  selectedProposal: Proposal | null
  selectedSubmission: ProposalSubmission | null
  action: 'approve' | 'reject' | 'modify' | null
  statusFilter: ProposalStatusFilter
  proposalToEditId: string | null
  submissionToDelete: ProposalSubmission | null
  proposalToViewId: string | null
  submissionToViewId: string | null
}

export interface ProposalsListData {
  proposals: Proposal[] // Legacy - kept for compatibility
  submissions: ProposalSubmission[]
  isLoading: boolean
  error: Error | null
  pageCount: number
}
