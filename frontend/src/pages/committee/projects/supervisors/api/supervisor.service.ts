import { apiClient } from '../../../../../lib/axios'
import type { Project } from '../../../../../types/project.types'
import type { User } from '../../../../../types/user.types'

export interface SupervisorAssignmentRequest {
  id: number
  project_id: number
  project: Project
  supervisor_id: number
  supervisor: User
  requested_by: number
  requestedBy: User
  responded_by?: number
  respondedBy?: User
  status: 'pending' | 'approved' | 'rejected'
  committee_notes?: string
  supervisor_response?: string
  responded_at?: string
  created_at: string
  updated_at: string
}

export const supervisorAssignmentService = {
  getProjectsWithoutSupervisor: async (page = 1, pageSize = 10): Promise<{ data: Project[], meta: { total: number, page: number, totalPages: number } }> => {
    const response = await apiClient.get(
      `/projects-committee/projects?supervisor_id=null&page=${page}&pageSize=${pageSize}`
    ) as any

    const data = Array.isArray(response.data) ? response.data : []
    const meta = response.pagination || { total: data.length, page, totalPages: 1 }

    return { data, meta }
  },

  getProjectsWithoutSupervisorCount: async (): Promise<number> => {
    try {
      const response = await apiClient.get(
        '/projects-committee/projects?supervisor_id=null&pageSize=1'
      ) as any
      
      if (response.pagination?.total !== undefined) {
        return response.pagination.total
      }
      return Array.isArray(response.data) ? response.data.length : 0
    } catch {
      return 0
    }
  },

  getAvailableSupervisors: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/projects-committee/supervisors')
    return Array.isArray(response.data) ? response.data : []
  },

  // Direct assignment (without approval requirement)
  assignSupervisor: async (projectId: string, supervisorId: string): Promise<Project> => {
    const response = await apiClient.post<Project>(
      `/projects-committee/supervisors/assign`,
      {
        project_id: projectId,
        supervisor_id: supervisorId,
      }
    )
    return response.data
  },

  // Request assignment (requires supervisor approval)
  requestAssignment: async (projectId: string, supervisorId: string, notes?: string): Promise<SupervisorAssignmentRequest> => {
    const response = await apiClient.post<SupervisorAssignmentRequest>(
      `/projects-committee/supervisors/request-assignment`,
      {
        project_id: projectId,
        supervisor_id: supervisorId,
        committee_notes: notes,
      }
    )
    return response.data
  },

  // Get assignment requests
  getAssignmentRequests: async (status?: string): Promise<SupervisorAssignmentRequest[]> => {
    const params = new URLSearchParams()
    if (status) params.append('status', status)

    const response = await apiClient.get<any>(
      `/projects-committee/supervisors/assignment-requests?${params.toString()}`
    )

    // Handle paginated response - data might be wrapped in pagination structure
    if (response.pagination && Array.isArray(response.data)) {
      return response.data
    }
    
    // If it's a direct array
    if (Array.isArray(response.data)) {
      return response.data
    }
    
    // Fallback
    return []
  },

  // Cancel assignment request
  cancelAssignmentRequest: async (requestId: number): Promise<void> => {
    await apiClient.delete(`/projects-committee/supervisors/assignment-requests/${requestId}`)
  },
}
