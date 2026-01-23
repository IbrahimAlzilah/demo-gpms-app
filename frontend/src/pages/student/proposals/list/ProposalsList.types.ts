import type { Proposal, ProposalSubmission } from '@/types/project.types'
import type { ProposalStatistics } from '../types/Proposals.types'

export interface ProposalsListState {
  selectedProposal: Proposal | null
  selectedSubmission: ProposalSubmission | null
  showForm: boolean
  showSubmissionForm: boolean
  showResubmitDialog: boolean
  proposalToResubmit: Proposal | null
  editingProposalId: string | null
}

export interface ProposalsListData {
  proposals: Proposal[]
  statistics: ProposalStatistics
  isLoading: boolean
  error: Error | null
}

export type { Proposal, ProposalStatistics }
