import type { ProjectMilestone } from '@/types/project.types'

export interface MilestoneFormData {
  title: string
  description?: string
  dueDate: string
  type: 'document_submission' | 'meeting' | 'discussion' | 'other'
}

export type { ProjectMilestone }
