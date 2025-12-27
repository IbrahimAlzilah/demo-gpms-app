import { mockDocumentService } from '../../../lib/mock/document.mock'
import type { Document, DocumentType } from '../../../types/request.types'
import type { TableQueryParams, TableResponse } from '../../../types/table.types'

function applyDocumentFilters(documents: Document[], filters?: Record<string, unknown>): Document[] {
  if (!filters || Object.keys(filters).length === 0) return documents
  
  return documents.filter((document) => {
    if (filters.type && document.type !== filters.type) return false
    if (filters.reviewStatus && document.reviewStatus !== filters.reviewStatus) return false
    if (filters.projectId && document.projectId !== filters.projectId) return false
    return true
  })
}

function applyDocumentSearch(documents: Document[], search?: string): Document[] {
  if (!search) return documents
  
  const searchLower = search.toLowerCase()
  return documents.filter((document) => 
    document.fileName.toLowerCase().includes(searchLower)
  )
}

function applyDocumentSorting(documents: Document[], sortBy?: string, sortOrder?: "asc" | "desc"): Document[] {
  if (!sortBy) return documents
  
  const sorted = [...documents].sort((a, b) => {
    let aValue: string | number | Date = ""
    let bValue: string | number | Date = ""
    
    switch (sortBy) {
      case "fileName":
        aValue = a.fileName
        bValue = b.fileName
        break
      case "createdAt":
        aValue = new Date(a.createdAt)
        bValue = new Date(b.createdAt)
        break
      case "fileSize":
        aValue = a.fileSize
        bValue = b.fileSize
        break
      default:
        return 0
    }
    
    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
    return 0
  })
  
  return sorted
}

export const documentService = {
  getAll: async (projectId?: string): Promise<Document[]> => {
    return mockDocumentService.getAll(projectId)
  },

  getTableData: async (params?: TableQueryParams, projectId?: string): Promise<TableResponse<Document>> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    
    let documents = await mockDocumentService.getAll(projectId)
    
    // Apply search
    if (params?.search) {
      documents = applyDocumentSearch(documents, params.search)
    }
    
    // Apply filters
    if (params?.filters) {
      documents = applyDocumentFilters(documents, params.filters)
    }
    
    // Apply sorting
    if (params?.sortBy) {
      documents = applyDocumentSorting(documents, params.sortBy, params.sortOrder)
    }
    
    const totalCount = documents.length
    const page = (params?.page ?? 1) - 1
    const pageSize = params?.pageSize ?? 10
    const start = page * pageSize
    const end = start + pageSize
    
    const paginatedDocuments = documents.slice(start, end)
    const totalPages = Math.ceil(totalCount / pageSize)
    
    return {
      data: paginatedDocuments,
      totalCount,
      page: page + 1,
      pageSize,
      totalPages,
    }
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

