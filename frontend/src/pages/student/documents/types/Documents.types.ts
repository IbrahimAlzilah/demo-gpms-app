import type { Document } from '@/types/request.types'

/**
 * Document filter options
 */
export interface DocumentFilters {
  type?: Document['type']
  reviewStatus?: Document['reviewStatus']
  projectId?: string
  search?: string
}

/**
 * Document table column definition props
 */
export interface DocumentTableColumnsProps {
  onView: (document: Document) => void
  t: (key: string) => string
}

/**
 * Document statistics
 */
export interface DocumentStatistics {
  total: number
  pending: number
  approved: number
  rejected: number
}

/**
 * Document list screen state
 */
export interface DocumentsListState {
  selectedDocument: Document | null
  showUploadForm: boolean
  selectedProjectId: string | undefined
}

/**
 * Document list screen data
 */
export interface DocumentsListData {
  documents: Document[]
  statistics: DocumentStatistics
  isLoading: boolean
  error: Error | null
}

/**
 * Document list screen props
 */
export interface DocumentsListScreenProps {
  // No props needed - uses route context
}

/**
 * Document view screen props
 */
export interface DocumentsViewScreenProps {
  documentId: string
  open: boolean
  onClose: () => void
}

/**
 * Document new screen props
 */
export interface DocumentsNewScreenProps {
  projectId: string
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export type { Document }
