import { apiClient } from '../../../../../lib/axios'
import type { Proposal } from '../../../../../types/project.types'
import type { TableQueryParams, TableResponse } from '../../../../../types/table.types'

export const committeeProposalService = {
  getAll: async (): Promise<Proposal[]> => {
    const response = await apiClient.get<Proposal[]>('/projects-committee/proposals')
    return Array.isArray(response.data) ? response.data : []
  },

  getPending: async (): Promise<Proposal[]> => {
    const response = await apiClient.get<Proposal[]>('/projects-committee/proposals?status=pending_review')
    return Array.isArray(response.data) ? response.data : []
  },

  getTableData: async (params?: TableQueryParams, status?: string): Promise<TableResponse<Proposal>> => {
    const queryParams = new URLSearchParams()
    
    if (status) queryParams.append('status', status)
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

    const response = await apiClient.get<{ data: Proposal[], pagination: any }>(
      `/projects-committee/proposals?${queryParams.toString()}`
    )
    
    return {
      data: response.data || [],
      totalCount: response.pagination?.total || 0,
      page: response.pagination?.page || 1,
      pageSize: response.pagination?.pageSize || 10,
      totalPages: response.pagination?.totalPages || 0,
    }
  },

  getById: async (id: string): Promise<Proposal | null> => {
    try {
      const response = await apiClient.get<Proposal>(`/projects-committee/proposals/${id}`)
      return response.data
    } catch {
      return null
    }
  },

  approve: async (id: string, reviewedBy: string, projectId?: string): Promise<Proposal> => {
    const response = await apiClient.post<Proposal>(
      `/projects-committee/proposals/${id}/approve`,
      { project_id: projectId }
    )
    return response.data
  },

  reject: async (id: string, reviewedBy: string, reviewNotes?: string): Promise<Proposal> => {
    const response = await apiClient.post<Proposal>(
      `/projects-committee/proposals/${id}/reject`,
      { review_notes: reviewNotes }
    )
    return response.data
  },

  requestModification: async (
    id: string,
    reviewedBy: string,
    reviewNotes: string
  ): Promise<Proposal> => {
    const response = await apiClient.post<Proposal>(
      `/projects-committee/proposals/${id}/request-modification`,
      { review_notes: reviewNotes }
    )
    return response.data
  },

  update: async (id: string, data: Partial<Proposal>): Promise<Proposal> => {
    const response = await apiClient.put<Proposal>(
      `/projects-committee/proposals/${id}`,
      data
    )
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects-committee/proposals/${id}`)
  },
}
