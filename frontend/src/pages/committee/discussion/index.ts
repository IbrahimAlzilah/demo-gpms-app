// Public API Facade - Barrel exports only (no components for Fast Refresh)

// Components
export { AssignedProjectsList } from './components/AssignedProjectsList'
export { FinalEvaluationForm } from './components/FinalEvaluationForm'
export { createAssignedProjectColumns } from './components/AssignedProjectTableColumns'

// Hooks
export {
  useCommitteeProjects,
  useCommitteeProject,
} from './hooks/useCommitteeProjects'
export { useSubmitFinalGrade } from './hooks/useFinalEvaluation'

// Types
export type * from './types'

// Schemas
export {
  finalEvaluationSchema,
} from './schema'
export type {
  FinalEvaluationSchema,
} from './schema'

// Store
export { useDiscussionCommitteeStore } from './store/discussion.store'

// API Services (for internal use, but exported for flexibility)
export { committeeEvaluationService } from './api/evaluation.service'
export { discussionCommitteeProjectService } from './api/project.service'
