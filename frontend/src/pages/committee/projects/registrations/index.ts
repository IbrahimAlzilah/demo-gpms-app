// Public API Facade - Barrel exports only (no components for Fast Refresh)

// Screens
export { RegistrationsList } from "./list/RegistrationsList.screen"

// Hooks
export {
  useRegistrations,
  useRegistration,
  useApproveRegistration,
  useRejectRegistration,
} from "./hooks/useRegistrationManagement"

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
