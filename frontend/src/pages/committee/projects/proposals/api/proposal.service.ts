import { apiClient } from '../../../../../lib/axios'
import type { Proposal } from '../../../../../types/project.types'
import type { TableQueryParams, TableResponse } from '../../../../../types/table.types'
import type { Submission } from '../types/GroupedSubmissions.types'

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

    const response = await apiClient.get<Proposal[]>(
      `/projects-committee/proposals?${queryParams.toString()}`
    )
    
    return {
      data: Array.isArray(response.data) ? response.data : [],
      totalCount: response.pagination?.total || 0,
      page: response.pagination?.page || 1,
      pageSize: response.pagination?.pageSize || 10,
      totalPages: response.pagination?.totalPages || 0,
    }
  },

  /**
   * Get proposals grouped by submissions (student groups or supervisors)
   * Returns paginated submissions, each containing all proposals from that group/supervisor
   */
  getSubmissionsTableData: async (
    params?: TableQueryParams,
    status?: string,
    search?: string
  ): Promise<TableResponse<Submission>> => {
    const queryParams = new URLSearchParams()
    
    if (status && status !== 'all') queryParams.append('status', status)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (search) queryParams.append('search', search)

    const response = await apiClient.get<Submission[]>(
      `/projects-committee/proposals/submissions?${queryParams.toString()}`
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
      const response = await apiClient.get<Proposal>(`/projects-committee/proposals/${id}`)
      return response.data
    } catch {
      return null
    }
  },

  approve: async (id: string, _reviewedBy: string, projectId?: string): Promise<Proposal> => {
    const response = await apiClient.post<Proposal>(
      `/projects-committee/proposals/${id}/approve`,
      { project_id: projectId }
    )
    return response.data
  },

  reject: async (id: string, _reviewedBy: string, reviewNotes?: string): Promise<Proposal> => {
    const response = await apiClient.post<Proposal>(
      `/projects-committee/proposals/${id}/reject`,
      { review_notes: reviewNotes }
    )
    return response.data
  },

  requestModification: async (
    id: string,
    _reviewedBy: string,
    reviewNotes: string
  ): Promise<Proposal> => {
    const response = await apiClient.post<Proposal>(
      `/projects-committee/proposals/${id}/request-modification`,
      { review_notes: reviewNotes }
    )
    return response.data
  },

  update: async (id: string, data: { title: string; description: string }): Promise<Proposal> => {
    const response = await apiClient.put<Proposal>(
      `/projects-committee/proposals/${id}`,
      {
        title: data.title,
        description: data.description,
      }
    )
    return response.data
  },

  delete: async (id: string, force = false): Promise<{ requiresConfirmation?: boolean; registrationDetails?: any[] }> => {
    const url = `/projects-committee/proposals/${id}${force ? '?force=1' : ''}`
    const response = await apiClient.delete<{
      success: boolean
      requires_confirmation?: boolean
      has_registrations?: boolean
      registration_details?: any[]
      message?: string
    }>(url)
    
    if (response.data.requires_confirmation) {
      return {
        requiresConfirmation: true,
        registrationDetails: response.data.registration_details || []
      }
    }
    
    return {}
  },

  /**
   * Create a proposal on behalf of a student or student group
   * Project Committee is not restricted by time windows
   */
  create: async (data: {
    title: string
    description: string
    proposedSupervisorId?: string
    submitterId: string
    studentGroupId?: string
    targetProjectId?: string
    teamMembers?: Array<{ name: string; role: string }>
  }): Promise<Proposal> => {
    const response = await apiClient.post<Proposal>(
      '/projects-committee/proposals',
      {
        title: data.title,
        description: data.description,
        proposed_supervisor_id: data.proposedSupervisorId,
        submitter_id: data.submitterId,
        student_group_id: data.studentGroupId,
        target_project_id: data.targetProjectId,
        team_members: data.teamMembers,
      }
    )
    return response.data
  },
}
