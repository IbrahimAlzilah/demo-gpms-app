import { apiClient } from '../../../../lib/axios'
import type { Document } from '../../../../types/request.types'

export const supervisorDocumentService = {
  getProjectDocuments: async (projectId: string): Promise<Document[]> => {
    try {
      // Documents are included in project details, but we can also fetch them separately
      // For now, we'll use the project endpoint which includes documents
      const response = await apiClient.get<{ data: { documents?: Document[] } }>(
        `/supervisor/projects/${projectId}`
      )
      return response.data?.documents || []
    } catch {
      return []
    }
  },

  download: async (projectId: string, documentId: string, fileName: string): Promise<void> => {
    const response = await apiClient.get(`/supervisor/projects/${projectId}/documents/${documentId}/download`, {
      responseType: 'blob',
    })
    
    // Create a blob from the response
    const blob = new Blob([response.data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  },

  review: async (
    projectId: string,
    documentId: string,
    status: 'approved' | 'rejected',
    comments?: string
  ): Promise<Document> => {
    const response = await apiClient.post<{ data: Document }>(
      `/supervisor/projects/${projectId}/documents/${documentId}/review`,
      {
        status,
        comments,
      }
    )
    return response.data
  },
}
