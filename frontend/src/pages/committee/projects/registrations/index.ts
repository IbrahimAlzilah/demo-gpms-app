// Public API Facade - Barrel exports only (no components for Fast Refresh)

// Screens
export { RegistrationsList } from "./list/RegistrationsList.screen"

// Components
export { RegistrationDetailsView } from "./components/RegistrationDetailsView"
export { createRegistrationColumns } from "./components/table"
export type { RegistrationTableColumnsProps } from "./components/table"

// Hooks
export {
  useRegistrations,
  useRegistration,
} from "./hooks/useRegistrations"
export {
  useApproveRegistration,
  useRejectRegistration,
} from "./hooks/useRegistrationOperations"

// Types
export type {
  RegistrationStatusFilter,
  RegistrationsListState,
  RegistrationsListData,
} from "./list/RegistrationsList.types"
export type * from "./types"

// API Services (for internal use, but exported for flexibility)
export { registrationService } from './api/registration.service'
export type {
  RegistrationListParams,
  ApproveRegistrationParams,
  RejectRegistrationParams,
} from './api/registration.service'
