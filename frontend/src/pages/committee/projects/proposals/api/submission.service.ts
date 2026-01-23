import { apiClient } from '../../../../../lib/axios'
import type { ProposalSubmission } from '../../../../../types/project.types'
import type { TableQueryParams, TableResponse } from '../../../../../types/table.types'

export const committeeSubmissionService = {
  getAll: async (): Promise<ProposalSubmission[]> => {
    const response = await apiClient.get<{ success: boolean; data: ProposalSubmission[] }>(
      '/projects-committee/proposal-submissions'
    )
    return Array.isArray(response.data.data) ? response.data.data : []
  },

  getTableData: async (params?: TableQueryParams, status?: string): Promise<TableResponse<ProposalSubmission>> => {
    const queryParams = new URLSearchParams()
    
    if (status && status !== 'all') queryParams.append('status', status)
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

    const response = await apiClient.get<ProposalSubmission[]>(
      `/projects-committee/proposal-submissions?${queryParams.toString()}`
    )
    
    // The axios interceptor extracts data and puts pagination at root level
    return {
      data: Array.isArray(response.data) ? response.data : [],
      totalCount: (response as any).pagination?.total || 0,
      page: (response as any).pagination?.page || 1,
      pageSize: (response as any).pagination?.pageSize || 10,
      totalPages: (response as any).pagination?.totalPages || 0,
    }
  },

  getById: async (id: string): Promise<ProposalSubmission | null> => {
    try {
      const response = await apiClient.get<{ success: boolean; data: ProposalSubmission }>(
        `/projects-committee/proposal-submissions/${id}`
      )
      return response.data.data
    } catch {
      return null
    }
  },

  approve: async (id: string, projectId?: string): Promise<ProposalSubmission> => {
    const response = await apiClient.post<{ success: boolean; data: ProposalSubmission }>(
      `/projects-committee/proposal-submissions/${id}/approve`,
      { project_id: projectId }
    )
    return response.data.data
  },

  reject: async (id: string, reviewNotes?: string): Promise<ProposalSubmission> => {
    const response = await apiClient.post<{ success: boolean; data: ProposalSubmission }>(
      `/projects-committee/proposal-submissions/${id}/reject`,
      { review_notes: reviewNotes }
    )
    return response.data.data
  },

  requestModification: async (
    id: string,
    reviewNotes: string
  ): Promise<ProposalSubmission> => {
    const response = await apiClient.post<{ success: boolean; data: ProposalSubmission }>(
      `/projects-committee/proposal-submissions/${id}/request-modification`,
      { review_notes: reviewNotes }
    )
    return response.data.data
  },

  update: async (id: string, proposals: Array<{ id: string; title: string; description: string }>): Promise<ProposalSubmission> => {
    const response = await apiClient.put<{ success: boolean; data: ProposalSubmission }>(
      `/projects-committee/proposal-submissions/${id}`,
      { proposals }
    )
    return response.data.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects-committee/proposal-submissions/${id}`)
  },
}
