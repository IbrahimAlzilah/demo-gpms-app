import { mockDocumentService } from '../../../lib/mock/document.mock'
import type { Document, DocumentType } from '../../../types/request.types'

export const documentService = {
  getAll: async (projectId?: string): Promise<Document[]> => {
    return mockDocumentService.getAll(projectId)
  },

  getById: async (id: string): Promise<Document | null> => {
    return mockDocumentService.getById(id)
  },

  upload: async (
    projectId: string,
    file: File,
    type: DocumentType,
    submittedBy: string
  ): Promise<Document> => {
    return mockDocumentService.upload(projectId, file, type, submittedBy)
  },

  delete: async (id: string): Promise<void> => {
    return mockDocumentService.delete(id)
  },
}

