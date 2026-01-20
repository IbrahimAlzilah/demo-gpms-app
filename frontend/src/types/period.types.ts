import type { BaseEntity } from './common.types'

/**
 * Unified period type matching backend TimePeriodType enum
 */
export type PeriodType =
  | 'proposal_submission'
  | 'proposal_review'
  | 'project_registration'
  | 'project_execution'
  | 'document_submission'
  | 'deliverable_submission'
  | 'supervisor_evaluation'
  | 'committee_evaluation'
  | 'discussion_evaluation'
  | 'discussion_evaluation_1'
  | 'discussion_evaluation_2'
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

