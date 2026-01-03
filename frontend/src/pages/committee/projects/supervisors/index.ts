// Public API Facade - Barrel exports only (no components for Fast Refresh)

// Screens
export { SupervisorsList } from "./list/SupervisorsList.screen"

// Hooks
export {
  useProjectsWithoutSupervisor,
  useAvailableSupervisors,
} from "./hooks/useSupervisors"
export { useAssignSupervisor } from "./hooks/useSupervisorOperations"

// Types
export type {
  SupervisorsListState,
  SupervisorsListData,
} from "./list/SupervisorsList.types"
export type * from "./types"

// API Services (for internal use, but exported for flexibility)
export { supervisorAssignmentService } from './api/supervisor.service'
