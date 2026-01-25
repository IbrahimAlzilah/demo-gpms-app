import type { BaseEntity } from './common.types'
import type { Project } from './project.types'
import type { User } from './user.types'

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
  | 'chapter_submission_phase_1'
  | 'final_defense_phase_1'
  | 'chapter_submission_phase_2'
  | 'final_defense_phase_2'
  | 'final_project_document_submission'
  | 'grade_approval'
  | 'general'

export interface EvaluationPeriod extends BaseEntity {
  type: EvaluationPeriodType
  startDate: string
  endDate: string
  isActive: boolean
  academicYear?: string
  semester?: string
}

