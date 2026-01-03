import type { BaseEntity } from './common.types'
import type { User } from './user.types'

export type ProjectStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'in_progress'
  | 'completed'
  | 'available_for_registration'

export interface Project extends BaseEntity {
  title: string
  description: string
  status: ProjectStatus
  supervisorId?: string
  supervisor?: User
  students: User[]
  groupId?: string
  committeeId?: string
  documents: string[]
  maxStudents: number
  currentStudents: number
  specialization?: string
  keywords?: string[]
}

export interface Proposal extends BaseEntity {
  title: string
  description: string
  objectives: string
  methodology?: string
  expectedOutcomes?: string
  submitterId: string
  submitter?: User
  status: 'pending_review' | 'approved' | 'rejected' | 'requires_modification'
  reviewNotes?: string
  reviewedBy?: string
  reviewer?: User
  reviewedAt?: string
  projectId?: string
  project?: Project
}

export interface ProjectGroup extends BaseEntity {
  projectId: string
  project?: Project
  members: User[]
  leaderId: string
  leader?: User
  maxMembers: number
}

export type ProjectRegistrationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export interface ProjectRegistration extends BaseEntity {
  projectId: string
  project?: Project
  studentId: string
  student?: User
  status: ProjectRegistrationStatus
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  reviewComments?: string
}

export interface SupervisorNote extends BaseEntity {
  projectId: string
  project?: Project
  supervisorId: string
  supervisor?: User
  content: string
  studentReplies?: NoteReply[]
}

export interface NoteReply extends BaseEntity {
  noteId: string
  authorId: string
  author?: User
  content: string
}

export interface ProjectMilestone extends BaseEntity {
  projectId: string
  project?: Project
  title: string
  description?: string
  dueDate: string
  type: 'document_submission' | 'meeting' | 'discussion' | 'other'
  completed: boolean
  completedAt?: string
}

export interface ProjectMeeting extends BaseEntity {
  projectId: string
  project?: Project
  scheduledBy: string
  scheduledByUser?: User
  scheduledDate: string
  duration?: number // in minutes
  location?: string
  agenda?: string
  notes?: string
  attendees: string[]
}

export type GroupInvitationStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled'

export interface GroupInvitation extends BaseEntity {
  groupId: string
  group?: ProjectGroup
  inviterId: string
  inviter?: User
  inviteeId: string
  invitee?: User
  status: GroupInvitationStatus
  message?: string
}

