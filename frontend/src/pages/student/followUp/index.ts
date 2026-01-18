// Public API Facade - Barrel exports only (no components for Fast Refresh)

// Screens
export { FollowUpList } from './list/FollowUpList.screen'

// Components
export { ProjectDashboard } from './components/ProjectDashboard'

// Hooks
export { useFollowUp } from './hooks/useFollowUp'

// Types
export type {
  FollowUpListScreenProps,
} from './types/FollowUp.types'
