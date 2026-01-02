// Public API Facade - Barrel exports only (no components for Fast Refresh)

// Screens
export { ProposalsList } from './list/ProposalsList.screen'

// Components
export { ProposalForm } from './components/ProposalForm'
export { ProposalManagement } from './components/ProposalManagement'
export { StatisticsCards } from './components/StatisticsCards'
export { createProposalColumns } from './components/table'

// Hooks
export { 
  useProposals, 
  useProposal,
  useSupervisorProposals,
  useSupervisorProposal,
  useCreateSupervisorProposal,
  useUpdateSupervisorProposal,
} from './hooks/useProposals'
export {
  useCreateProposal,
  useUpdateProposal,
} from './hooks/useProposalOperations'

// Types
export type {
  ProposalFormData,
  ProposalFilters,
  ProposalTableColumnsProps,
  ProposalStatistics,
  ProposalsListScreenProps,
  ProposalsViewScreenProps,
  ProposalsNewScreenProps,
} from './types/Proposals.types'

// Schemas
export {
  proposalFormSchema,
} from './schema'
export type { ProposalFormSchema } from './schema'

// API Services (for internal use, but exported for flexibility)
export { proposalService } from './api/proposal.service'
