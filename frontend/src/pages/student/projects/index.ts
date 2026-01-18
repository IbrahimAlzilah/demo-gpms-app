// Public API Facade - Barrel exports only (no components for Fast Refresh)

// Screens
export { ProjectsList } from './list/ProjectsList.screen'
export { ProjectsView } from './view/ProjectsView.screen'
export { ProjectsRegister } from './register/ProjectsRegister.screen'

// Components
export { ProjectBrowser } from './components/ProjectBrowser'
export { ProjectRegistrationForm } from './components/ProjectRegistrationForm'
export { ProjectCard } from './components/ProjectCard'
export { createProjectColumns } from './components/table'

// Hooks
export { 
  useProjects, 
  useProject, 
  useAvailableProjects,
  useStudentRegistrations,
  useProjectRegistration,
  useRegisterProject,
  useCancelRegistration,
} from './hooks/useProjects'
export {
  useRegisterProject as useRegisterProjectOp,
  useCancelRegistration as useCancelRegistrationOp,
} from './hooks/useProjectOperations'

// Types
export type {
  ProjectFilters,
  ProjectTableColumnsProps,
  ProjectsListScreenProps,
  ProjectsViewScreenProps,
  ProjectsRegisterScreenProps,
} from './types/Projects.types'

// Store
export { useStudentStore } from './store/projects.store'

// API Services (for internal use, but exported for flexibility)
export { projectService } from './api/project.service'
