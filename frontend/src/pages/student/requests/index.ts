// Public API Facade - Barrel exports only (no components for Fast Refresh)

// Screens
export { RequestsList } from './list/RequestsList.screen'
export { RequestsView } from './view/RequestsView.screen'
export { RequestsNew } from './new/RequestsNew.screen'
export { RequestsEdit } from './edit/RequestsEdit.screen'

// Components
export { StatisticsCards } from './components/StatisticsCards'
export { createRequestColumns } from './components/table'

// Hooks
export { 
  useRequests, 
  useRequest,
  useCreateRequest,
  useCancelRequest,
} from './hooks/useRequests'
export {
  useCreateRequest as useCreateRequestOp,
  useUpdateRequest,
  useDeleteRequest,
  useCancelRequest as useCancelRequestOp,
} from './hooks/useRequestOperations'

// Types
export type {
  RequestFilters,
  RequestTableColumnsProps,
  RequestStatistics,
  RequestsListScreenProps,
  RequestsViewScreenProps,
  RequestsNewScreenProps,
} from './types/Requests.types'

// Schemas
export {
  requestSubmissionSchema,
} from './schema'
export type {
  RequestSubmissionSchema,
} from './schema'

// API Services (for internal use, but exported for flexibility)
export { requestService } from './api/request.service'
