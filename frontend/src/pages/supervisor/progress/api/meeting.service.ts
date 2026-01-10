import { apiClient } from '../../../../lib/axios'
import type { ProjectMeeting } from '@/types/project.types'

export interface CreateMeetingData {
  scheduled_date: string
  duration?: number
  location?: string
  agenda?: string
  attendee_ids?: string[]
}

export interface UpdateMeetingData {
  scheduled_date?: string
  duration?: number
  location?: string
  agenda?: string
  notes?: string
  attendee_ids?: string[]
}

export const meetingService = {
  getAll: async (projectId: string): Promise<ProjectMeeting[]> => {
    const response = await apiClient.get<{ success: boolean; data: ProjectMeeting[] }>(
      `/supervisor/projects/${projectId}/meetings`
    )
    return response.data?.data || response.data || []
  },

  create: async (projectId: string, data: CreateMeetingData): Promise<ProjectMeeting> => {
    const response = await apiClient.post<ProjectMeeting>(
      `/supervisor/projects/${projectId}/meetings`,
      data
    )
    return response.data
  },

  update: async (meetingId: string, data: UpdateMeetingData): Promise<ProjectMeeting> => {
    const response = await apiClient.put<ProjectMeeting>(
      `/supervisor/meetings/${meetingId}`,
      data
    )
    return response.data
  },

  delete: async (meetingId: string): Promise<void> => {
    await apiClient.delete(`/supervisor/meetings/${meetingId}`)
  },
}
