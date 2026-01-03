// Public API Facade - Barrel exports only (no components for Fast Refresh)

// Screens
export { AnnounceProjectsList } from "./list/AnnounceProjectsList.screen"

// Components
export { createAnnounceProjectsColumns } from "./components/table"
export type { AnnounceProjectsTableColumnsProps } from "./components/table"

// Hooks
export { useAnnounceProjects } from "./hooks/useAnnounceProjects"
export { useAnnounceProjects as useAnnounceProjectsOperation } from "./hooks/useAnnounceProjectsOperations"

// Types
export type {
  AnnounceProjectsListState,
  AnnounceProjectsListData,
} from "./list/AnnounceProjectsList.types"
export type * from "./types"

// API Services (for internal use, but exported for flexibility)
export { committeeProjectService } from './api/project.service'
