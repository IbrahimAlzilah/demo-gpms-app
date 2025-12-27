import type { BaseEntity } from './common.types'
import type { User, Project } from './project.types'

export interface EvaluationCriteria {
  id: string
  name: string
  description?: string
  weight: number
  maxScore: number
  category: 'supervisor' | 'committee' | 'both'
}

export interface Grade extends BaseEntity {
  projectId: string
  project?: Project
  studentId: string
  student?: User
  supervisorGrade?: {
    score: number
    maxScore: number
    criteria: Record<string, number>
    comments?: string
    evaluatedAt: string
    evaluatedBy: string
  }
  committeeGrade?: {
    score: number
    maxScore: number
    criteria: Record<string, number>
    comments?: string
    evaluatedAt: string
    evaluatedBy: string
    committeeMembers: string[]
  }
  finalGrade?: number
  isApproved: boolean
  approvedAt?: string
  approvedBy?: string
}

export type EvaluationPeriodType =
  | 'proposal_submission'
  | 'project_registration'
  | 'document_submission'
  | 'supervisor_evaluation'
  | 'committee_evaluation'
  | 'final_discussion'

export interface EvaluationPeriod extends BaseEntity {
  type: EvaluationPeriodType
  startDate: string
  endDate: string
  isActive: boolean
  academicYear?: string
  semester?: string
}

