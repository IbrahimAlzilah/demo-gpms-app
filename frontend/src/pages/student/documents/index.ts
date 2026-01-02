// Public API Facade - Barrel exports only (no components for Fast Refresh)

// Screens
export { DocumentsList } from './list/DocumentsList.screen'
export { DocumentsNew } from './new/DocumentsNew.screen'
export { DocumentsView } from './view/DocumentsView.screen'

// Components
export { DocumentUpload } from './components/DocumentUpload'
export { StatisticsCards } from './components/StatisticsCards'
export { createDocumentColumns } from './components/table'

// Hooks
export { useDocuments, useDocument } from './hooks/useDocuments'
export { useUploadDocument, useDeleteDocument } from './hooks/useDocumentOperations'

// Types
export type {
  DocumentFilters,
  DocumentTableColumnsProps,
  DocumentStatistics,
  DocumentsListScreenProps,
  DocumentsViewScreenProps,
  DocumentsNewScreenProps,
  Document,
} from './types/Documents.types'

// Schemas
export { documentUploadSchema, type DocumentUploadSchema } from './schema'
