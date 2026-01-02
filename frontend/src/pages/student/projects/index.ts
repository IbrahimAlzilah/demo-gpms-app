// Public API Facade - Barrel exports only (no components for Fast Refresh)

// Screens
export { ProjectsList } from './list/ProjectsList.screen'
export { ProjectsView } from './view/ProjectsView.screen'
export { ProjectsRegister } from './register/ProjectsRegister.screen'

// Components
export { ProjectBrowser } from './components/ProjectBrowser'
export { ProjectRegistrationForm } from './components/ProjectRegistrationForm'
export { createProjectColumns } from './components/table'

// Hooks
export { useProjects, useProject, useAvailableProjects } from './hooks/useProjects'
export {
  useStudentRegistrations,
  useProjectRegistration,
  useRegisterProject,
  useCancelRegistration,
} from './hooks/useProjectOperations'

// Types
export type {
  ProjectFilters,
  ProjectTableColumnsProps,
  ProjectsListScreenProps,
  ProjectsViewScreenProps,
  ProjectsRegisterScreenProps,
} from './types/Projects.types'
