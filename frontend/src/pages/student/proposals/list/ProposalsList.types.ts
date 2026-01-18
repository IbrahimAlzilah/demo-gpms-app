import type { Proposal } from '@/types/project.types'
import type { ProposalStatistics } from '../types/Proposals.types'

export interface ProposalsListState {
  selectedProposal: Proposal | null
  showForm: boolean
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
