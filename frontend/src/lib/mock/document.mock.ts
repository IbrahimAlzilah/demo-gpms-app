import { v4 as uuidv4 } from 'uuid'
import type { Document, DocumentType } from '../../types/request.types'

// Mock documents database
export const mockDocuments: Document[] = [
  {
    id: '1',
    type: 'chapters',
    projectId: '2',
    fileName: 'chapter1.pdf',
    fileUrl: '/mock/files/chapter1.pdf',
    fileSize: 1024000,
    mimeType: 'application/pdf',
    submittedBy: '1',
    reviewStatus: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const mockDocumentService = {
  getAll: async (projectId?: string): Promise<Document[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    let documents = [...mockDocuments]
    if (projectId) {
      documents = documents.filter((d) => d.projectId === projectId)
    }
    return documents
  },

  getById: async (id: string): Promise<Document | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockDocuments.find((d) => d.id === id) || null
  },

  upload: async (
    projectId: string,
    file: File,
    type: DocumentType,
    submittedBy: string
  ): Promise<Document> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const document: Document = {
      id: uuidv4(),
      type,
      projectId,
      fileName: file.name,
      fileUrl: `/mock/files/${file.name}`,
      fileSize: file.size,
      mimeType: file.type,
      submittedBy,
      reviewStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockDocuments.push(document)
    return document
  },

  update: async (id: string, data: Partial<Document>): Promise<Document> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const index = mockDocuments.findIndex((d) => d.id === id)
    if (index === -1) throw new Error('Document not found')
    mockDocuments[index] = {
      ...mockDocuments[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    return mockDocuments[index]
  },

  delete: async (id: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const index = mockDocuments.findIndex((d) => d.id === id)
    if (index === -1) throw new Error('Document not found')
    mockDocuments.splice(index, 1)
  },
}

