import { apiClient } from '../../../../lib/axios'
import type { Document, DocumentType } from '../../../../types/request.types'
import type { TableQueryParams, TableResponse } from '../../../../types/table.types'

export const documentService = {
  getAll: async (projectId?: string): Promise<Document[]> => {
    const url = projectId 
      ? `/student/documents?project_id=${projectId}`
      : '/student/documents'
    const response = await apiClient.get<Document[]>(url)
    return Array.isArray(response.data) ? response.data : []
  },

  getTableData: async (params?: TableQueryParams, projectId?: string): Promise<TableResponse<Document>> => {
    const queryParams = new URLSearchParams()
    
    if (projectId) queryParams.append('project_id', projectId)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
    if (params?.search) queryParams.append('search', params.search)
    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(`filters[${key}]`, String(value))
        }
      })
    }

    const response = await apiClient.get<{ data: Document[], pagination: any }>(
      `/student/documents?${queryParams.toString()}`
    )
    
    return {
      data: response.data || [],
      totalCount: response.pagination?.total || 0,
      page: response.pagination?.page || 1,
      pageSize: response.pagination?.pageSize || 10,
      totalPages: response.pagination?.totalPages || 0,
    }
  },

  getById: async (id: string): Promise<Document | null> => {
    try {
      const response = await apiClient.get<Document>(`/student/documents/${id}`)
      return response.data
    } catch {
      return null
    }
  },

  upload: async (
    projectId: string,
    file: File,
    type: DocumentType,
    submittedBy: string
  ): Promise<Document> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('project_id', projectId)
    formData.append('type', type)

    // Don't set Content-Type header - axios will handle it automatically for FormData
    const response = await apiClient.post<Document>('/student/documents', formData)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/student/documents/${id}`)
  },
}
