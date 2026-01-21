// Public API Facade - Barrel exports only (no components for Fast Refresh)

// Screens
export { ProposalsList } from "./list/ProposalsList.screen"
export { ProposalsNew } from "./new/ProposalsNew.screen"
export { ProposalsEdit } from "./edit/ProposalsEdit.screen"
export { ProposalsView } from "./view/ProposalsView.screen"

// Components
export { ProposalReviewDialog } from "./components/ProposalReviewDialog"
export { createProposalColumns } from "./components/table"
export type { ProposalTableColumnsProps } from "./components/table"

// Hooks
export {
  usePendingProposals,
  useAllProposals,
  useProposal,
} from "./hooks/useProposals"
export {
  useApproveProposal,
  useRejectProposal,
  useRequestModification,
} from "./hooks/useProposalOperations"

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
