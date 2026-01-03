// Public API Facade - Barrel exports only (no components for Fast Refresh)

// Screens
export { PeriodsList } from "./list/PeriodsList.screen"

// Components
export { createPeriodColumns } from "./components/table"
export type { PeriodTableColumnsProps } from "./components/table"
export { PeriodForm } from "./components/PeriodForm"

// Hooks
export { usePeriods } from "./hooks/usePeriods"
export { usePeriodForm } from "./hooks/usePeriodForm"
export {
  useCreatePeriod,
  useUpdatePeriod,
  useDeletePeriod,
} from "./hooks/usePeriodOperations"

// Types
export type {
  PeriodsListState,
  PeriodsListData,
} from "./list/PeriodsList.types"
export type * from "./types"

// Schemas
export {
  timePeriodSchema,
} from "./schema"
export type {
  TimePeriodSchema,
} from "./schema"

// API Services (for internal use, but exported for flexibility)
export { periodService } from './api/period.service'
