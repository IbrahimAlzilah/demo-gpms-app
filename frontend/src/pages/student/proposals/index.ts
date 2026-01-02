// Public API Facade - Barrel exports only (no components for Fast Refresh)

// Screens
export { ProposalsList } from "./list/ProposalsList.screen";
export { ProposalsNew } from "./new/ProposalsNew.screen";
export { ProposalsEdit } from "./edit/ProposalsEdit.screen";
export { ProposalsView } from "./view/ProposalsView.screen";

// Components
export { ProposalForm } from "./components/ProposalForm";
export { StatisticsCards } from "./components/StatisticsCards";
export { createProposalColumns } from "./components/table";

// Hooks
export { useProposals, useProposal } from "./hooks/useProposals";
export { useProposalForm } from "./hooks/useProposalForm";
export {
  useCreateProposal,
  useUpdateProposal,
  useResubmitProposal,
} from "./hooks/useProposalOperations";

// Types
export type {
  ProposalFormData,
  ProposalFilters,
  ProposalTableColumnsProps,
  ProposalStatistics,
  ProposalsListScreenProps,
  ProposalsViewScreenProps,
  ProposalsEditScreenProps,
  ProposalsNewScreenProps,
} from "./types/Proposals.types";

// Schemas
export {
  proposalFormSchema,
  proposalIdSchema,
  proposalStatusSchema,
} from "./schema";
export type { ProposalFormSchema } from "./schema";
