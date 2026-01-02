// Public API Facade - Barrel exports only (no components for Fast Refresh)

// Screens
export { ProjectsList } from './list/ProjectsList.screen'

// Components
export { createProjectColumns } from './components/table'
export { ProjectList } from './components/ProjectList'

// Hooks
export { 
  useProjects, 
  useProject,
  useSupervisorProjects,
  useSupervisorProject,
} from './hooks/useProjects'

// Types
export type {
  ProjectFilters,
  ProjectTableColumnsProps,
  ProjectsListScreenProps,
  ProjectsViewScreenProps,
} from './types/Projects.types'

// Store
export { useSupervisorStore } from './store/projects.store'

// API Services (for internal use, but exported for flexibility)
export { projectService } from './api/project.service'
