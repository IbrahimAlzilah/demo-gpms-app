// Public API Facade - Barrel exports only (no components for Fast Refresh)

// Screens
export { PeriodsList } from "./list/PeriodsList.screen"

// Components
export { createPeriodColumns } from "./components/PeriodTableColumns"

// Hooks
export {
  usePeriods,
  useCreatePeriod,
  useUpdatePeriod,
  useDeletePeriod,
} from "./hooks/usePeriods"

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
