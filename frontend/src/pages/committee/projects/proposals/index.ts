// Public API Facade - Barrel exports only (no components for Fast Refresh)

// Screens
export { ProposalsList } from "./list/ProposalsList.screen"

// Components
export { ProposalReviewDialog } from "./components/ProposalReviewDialog"
export { createProposalColumns } from "./components/ProposalTableColumns"

// Hooks
export {
  usePendingProposals,
  useAllProposals,
  useProposal,
  useApproveProposal,
  useRejectProposal,
  useRequestModification,
} from "./hooks/useProposalManagement"

// Types
export type {
  ProposalStatusFilter,
  ProposalsListState,
  ProposalsListData,
} from "./list/ProposalsList.types"
export type * from "./types"

// Schemas
export {
  proposalReviewSchema,
} from "./schema"
export type {
  ProposalReviewSchema,
} from "./schema"

// API Services (for internal use, but exported for flexibility)
export { committeeProposalService } from './api/proposal.service'
