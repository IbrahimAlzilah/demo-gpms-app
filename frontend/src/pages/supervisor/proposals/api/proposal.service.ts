import { apiClient } from '../../../../lib/axios'
import type { Proposal } from '../../../../types/project.types'
import type { TableQueryParams, TableResponse } from '../../../../types/table.types'

export const proposalService = {
  getAll: async (): Promise<Proposal[]> => {
    const response = await apiClient.get<Proposal[]>('/supervisor/proposals')
    return Array.isArray(response.data) ? response.data : []
  },

  getTableData: async (params?: TableQueryParams): Promise<TableResponse<Proposal>> => {
    const queryParams = new URLSearchParams()
    
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

    const response = await apiClient.get<Proposal[]>(
      `/supervisor/proposals?${queryParams.toString()}`
    )
    
    return {
      data: Array.isArray(response.data) ? response.data : [],
      totalCount: response.pagination?.total || 0,
      page: response.pagination?.page || 1,
      pageSize: response.pagination?.pageSize || 10,
      totalPages: response.pagination?.totalPages || 0,
    }
  },

  getById: async (id: string): Promise<Proposal | null> => {
    try {
      const response = await apiClient.get<Proposal>(`/supervisor/proposals/${id}`)
      return response.data
    } catch {
      return null
    }
  },

  create: async (
    data: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<Proposal> => {
    const response = await apiClient.post<Proposal>('/supervisor/proposals', {
      title: data.title,
      description: data.description,
    })
    return response.data
  },

  update: async (id: string, data: Partial<Proposal>): Promise<Proposal> => {
    // Only send title and description for updates (proposed_supervisor_id and team_members are not editable)
    const response = await apiClient.put<Proposal>(`/supervisor/proposals/${id}`, {
      title: data.title,
      description: data.description,
    })
    return response.data
  },

  createBatch: async (
    proposals: Array<{ title: string; description: string }>
  ): Promise<Proposal[]> => {
    const response = await apiClient.post<{ data: Proposal[] }>('/supervisor/proposals/batch', {
      proposals: proposals.map(p => ({
        title: p.title,
        description: p.description,
      })),
    })
    return response.data.data || []
  },

  getStudentGroups: async (): Promise<Array<{ id: string; name: string; code: string; leader: { id: string; name: string; email: string } }>> => {
    const response = await apiClient.get<{ data: Array<{ id: string; name: string; code: string; leader: { id: string; name: string; email: string } }> }>('/supervisor/proposals/student-groups')
    return response.data.data || []
  },

  assignToGroup: async (proposalId: string, studentGroupId: string): Promise<Proposal> => {
    const response = await apiClient.post<{ data: Proposal }>(`/supervisor/proposals/${proposalId}/assign`, {
      student_group_id: studentGroupId,
    })
    return response.data.data
  },

  requestAssignment: async (proposalId: string, studentGroupId: string, notes?: string): Promise<Proposal> => {
    const response = await apiClient.post<{ data: Proposal }>(`/supervisor/proposals/${proposalId}/request-assignment`, {
      student_group_id: studentGroupId,
      notes: notes || null,
    })
    return response.data.data
  },
}
