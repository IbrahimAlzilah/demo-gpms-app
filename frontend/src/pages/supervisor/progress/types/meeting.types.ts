import type { ProjectMeeting } from '@/types/project.types'

export interface MeetingFormData {
  scheduledDate: string
  duration?: number
  location?: string
  agenda?: string
  attendeeIds?: string[]
}

export type { ProjectMeeting }
