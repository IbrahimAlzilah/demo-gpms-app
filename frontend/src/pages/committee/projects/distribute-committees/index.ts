// Public API Facade - Barrel exports only (no components for Fast Refresh)

// Screens
export { DistributeCommitteesList } from "./list/DistributeCommitteesList.screen"

// Hooks
export {
  useProjectsReadyForDiscussion,
  useDiscussionCommitteeMembers,
  useDistributeProjects,
} from "./hooks/useCommitteeDistribution"

// Types
export type {
  DistributeCommitteesListState,
  DistributeCommitteesListData,
} from "./list/DistributeCommitteesList.types"
export type * from "./types"

// API Services (for internal use, but exported for flexibility)
export { committeeDistributionService } from './api/committee.service'
export type { CommitteeAssignment } from './api/committee.service'
