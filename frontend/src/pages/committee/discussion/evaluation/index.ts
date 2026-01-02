// Public API Facade - Barrel exports only (no components for Fast Refresh)

// Screens
export { EvaluationList } from "./list/EvaluationList.screen"
export { EvaluationNew } from "./new/EvaluationNew.screen"

// Components
export { FinalEvaluationForm } from "./components/FinalEvaluationForm"
export { createEvaluationColumns } from "./components/EvaluationTableColumns"

// Hooks
export { useSubmitFinalGrade } from "./hooks/useFinalEvaluation"

// Types
export type {
  EvaluationNewState,
  EvaluationNewProps,
} from "./new/EvaluationNew.types"
export type {
  EvaluationListState,
  EvaluationListData,
  EvaluationListItem,
} from "./list/EvaluationList.types"
export type * from "./types"

// Schemas
export {
  finalEvaluationSchema,
} from "./schema"
export type {
  FinalEvaluationSchema,
} from "./schema"

// API Services (for internal use, but exported for flexibility)
export { committeeEvaluationService } from './api/evaluation.service'
