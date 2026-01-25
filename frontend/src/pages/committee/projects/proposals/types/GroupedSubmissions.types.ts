import type { Proposal } from '@/types/project.types'
import type { StudentGroup } from '@/types/project.types'
import type { User } from '@/types/user.types'

/**
 * Grouped submission types
 */
export type SubmissionOrigin = 'student_group' | 'supervisor'

/**
 * Base interface for grouped submissions
 */
export interface GroupedSubmission {
  id: string // Unique identifier for the submission group
  origin: SubmissionOrigin
  proposals: Proposal[]
  submittedAt: string // Earliest proposal submission date
  lastUpdatedAt?: string // Latest proposal update date
  status: 'pending_review' | 'approved' | 'rejected' | 'requires_modification' | 'mixed'
  totalProposals: number
}

/**
 * Student group submission - contains proposals from a student group
 */
export interface StudentGroupSubmission extends GroupedSubmission {
  origin: 'student_group'
  studentGroupId: string | null
  studentGroup: StudentGroup | null
  submitter: User | null // Group leader who submitted
}

/**
 * Supervisor submission - contains proposals from a supervisor
 */
export interface SupervisorSubmission extends GroupedSubmission {
  origin: 'supervisor'
  supervisorId: string
  supervisor: User | null // Supervisor who submitted
}

/**
 * Union type for all submission types
 */
export type Submission = StudentGroupSubmission | SupervisorSubmission
