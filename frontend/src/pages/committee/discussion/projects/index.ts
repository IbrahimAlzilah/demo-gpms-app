// Public API Facade - Barrel exports only (no components for Fast Refresh)

// Screens
export { ProjectsList } from "./list/ProjectsList.screen"

// Components
export { createAssignedProjectColumns } from "./components/AssignedProjectTableColumns"

// Hooks
export {
  useCommitteeProjects,
  useCommitteeProject,
} from "./hooks/useCommitteeProjects"

// Types
export type {
  ProjectsListData,
} from "./list/ProjectsList.types"
export type * from "./types"

// API Services (for internal use, but exported for flexibility)
export { discussionCommitteeProjectService } from './api/project.service'
