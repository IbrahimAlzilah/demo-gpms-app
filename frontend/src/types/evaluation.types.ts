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
    members?: Record<string, any>
  }
  finalGrade?: number
  isApproved: boolean
  approvedAt?: string
  approvedBy?: string
  /** FD1 specific fields */
  fd1FinalGrade?: number | null
  fd1Adjustment?: number | null
  isFd1Approved?: boolean
  fd1Published?: boolean
  fd1ApprovalStatus?: 'pending' | 'approved' | 'published'
  fd1GradeBreakdown?: GradeBreakdown & { defenseStage?: 'fd1' }
  /** FD2 specific fields */
  fd2FinalGrade?: number | null
  fd2Adjustment?: number | null
  isFd2Approved?: boolean
  fd2Published?: boolean
  fd2ApprovalStatus?: 'pending' | 'approved' | 'published'
  fd2GradeBreakdown?: GradeBreakdown & { defenseStage?: 'fd2' }
  /** Detailed component scores */
  fd1SupervisorScore?: number | null
  fd1CommitteeScore?: number | null
  fd2SupervisorScore?: number | null
  fd2CommitteeScore?: number | null
  /** Supervisor/committee breakdown from defense evaluations (if available) */
  displaySupervisorGrade?: { score: number | null; maxScore: number; evaluatedAt?: string; evaluatedBy?: string } | null
  displayCommitteeGrade?: { score: number | null; maxScore: number; evaluatedAt?: string; committeeMembers?: string[] } | null
  approver?: User
  /** Computed fields from backend */
  supervisorScore?: number | null
  committeeScore?: number | null
  isReadyForApproval?: boolean
  validationErrors?: string[]
  /** Detailed grade breakdown with individual contributions */
  gradeBreakdown?: GradeBreakdown
  supervisorContribution?: number
  committeeContribution?: number
  projectCommitteeContribution?: number
  committeeEvaluations?: DefenseEvaluation[]
  supervisorEvaluation?: DefenseEvaluation | null
  projectCommitteeEvaluations?: DefenseEvaluation[]
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

export type DefenseStage = 'fd1' | 'fd2'

export interface DefenseEvaluation extends BaseEntity {
  projectId: string
  studentId: string
  evaluatorId: string
  evaluatorRole: 'supervisor' | 'committee_member' | 'project_committee'
  defenseStage: DefenseStage
  score: number;
  maxScore: number;
  criteria?: Record<string, unknown>
  notes?: string
  evaluator?: User
  evaluatorName?: string
  normalizedScore?: number
  contribution?: number
  formula?: string
}

export interface GradeBreakdown {
  supervisor: {
    id: string
    evaluatorId: string
    evaluatorName: string
    rawScore: number
    maxScore: number
    normalizedScore: number
    contribution: number
    formula: string
    notes?: string
    createdAt?: string
  } | null
  supervisorContribution: number
  committeeMembers: Array<{
    id: string
    evaluatorId: string
    evaluatorName: string
    rawScore: number
    maxScore: number
    normalizedScore: number
    contribution: number
    formula: string
    notes?: string
    createdAt?: string
  }>
  committeeContribution: number
  projectCommitteeMembers: Array<{
    id: string
    evaluatorId: string
    evaluatorName: string
    rawScore: number
    maxScore: number
    normalizedScore: number
    contribution: number
    formula: string
    notes?: string
    createdAt?: string
  }>
  projectCommitteeContribution: number
  finalGrade: number | null
}

