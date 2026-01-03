// Public API Facade - Barrel exports only (no components for Fast Refresh)

// Screens
export { ProjectsList } from "./list/ProjectsList.screen"

// Components
export { createProjectsColumns } from "./components/table"
export type { ProjectsTableColumnsProps } from "./components/table"

// Hooks
export {
  useProjects,
  useProject,
} from "./hooks/useProjects"

// Types
export type {
  ProjectsListData,
} from "./list/ProjectsList.types"
export type * from "./types"

// API Services (for internal use, but exported for flexibility)
export { discussionCommitteeProjectService } from './api/project.service'
