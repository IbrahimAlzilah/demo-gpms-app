import type { Document } from '@/types/request.types'
import type { DocumentStatistics } from '../types/Documents.types'

export interface DocumentsListState {
  selectedDocument: Document | null
  showUploadForm: boolean
  selectedProjectId: string | undefined
}

export interface DocumentsListData {
  documents: Document[]
  statistics: DocumentStatistics
  isLoading: boolean
  error: Error | null
}

export type { Document, DocumentStatistics }
