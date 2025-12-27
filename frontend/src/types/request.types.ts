import type { BaseEntity } from './common.types'
import type { User } from './user.types'
import type { Project } from './project.types'

export type RequestType =
  | 'change_supervisor'
  | 'change_group'
  | 'change_project'
  | 'other'

export type RequestStatus =
  | 'pending'
  | 'supervisor_approved'
  | 'supervisor_rejected'
  | 'committee_approved'
  | 'committee_rejected'
  | 'cancelled'

export interface Request extends BaseEntity {
  type: RequestType
  studentId: string
  student?: User
  projectId?: string
  project?: Project
  reason: string
  status: RequestStatus
  supervisorApproval?: {
    approved: boolean
    comments?: string
    approvedAt?: string
    approvedBy?: string
  }
  committeeApproval?: {
    approved: boolean
    comments?: string
    approvedAt?: string
    approvedBy?: string
  }
  additionalData?: Record<string, unknown>
}

export type DocumentType =
  | 'proposal'
  | 'chapters'
  | 'final_report'
  | 'code'
  | 'presentation'
  | 'other'

export interface Document extends BaseEntity {
  type: DocumentType
  projectId: string
  project?: Project
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  submittedBy: string
  submittedByUser?: User
  reviewedBy?: string
  reviewedAt?: string
  reviewStatus: 'pending' | 'approved' | 'rejected'
  reviewComments?: string
}

