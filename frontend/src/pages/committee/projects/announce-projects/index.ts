// Public API Facade - Barrel exports only (no components for Fast Refresh)

// Screens
export { AnnounceProjectsList } from "./list/AnnounceProjectsList.screen"

// Components
export { createProjectAnnouncementColumns } from "./components/ProjectAnnouncementTableColumns"

// Hooks
export {
  useApprovedProjects,
  useAnnounceProjects,
} from "./hooks/useProjectAnnouncement"

// Types
export type {
  AnnounceProjectsListState,
  AnnounceProjectsListData,
} from "./list/AnnounceProjectsList.types"
export type * from "./types"

// API Services (for internal use, but exported for flexibility)
export { committeeProjectService } from './api/project.service'
