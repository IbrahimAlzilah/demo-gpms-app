import type { BaseEntity } from './common.types'

/**
 * Unified period type matching backend TimePeriodType enum
 */
export type PeriodType =
  | 'proposal_submission'
  | 'project_registration'
  | 'document_submission'
  | 'supervisor_evaluation'
  | 'committee_evaluation'
  | 'discussion_evaluation'
  | 'final_discussion'
  | 'grade_approval'
  | 'general'

export interface TimePeriod extends BaseEntity {
  name: string
  type: PeriodType
  startDate: string
  endDate: string
  isActive: boolean
  academicYear?: string
  semester?: string
  description?: string
  createdBy: string
}

