import type { BaseEntity } from "./common.types";
import type { User } from "./user.types";
import type { Document } from "./request.types";

export type ProjectStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "in_progress"
  | "completed"
  | "available_for_registration";

export interface Project extends BaseEntity {
  title: string;
  description: string;
  status: ProjectStatus;
  supervisorId?: string;
  supervisor?: User;
  students: User[];
  groupId?: string;
  groupName?: string;
  committeeId?: string;
  documents: (string | Document)[];
  maxStudents: number;
  currentStudents: number;
  specialization?: string;
  keywords?: string[];
  supervisorApprovalStatus?: "pending" | "approved" | "rejected";
  supervisorApprovalComments?: string;
  supervisorApprovalAt?: string;
}

export interface Proposal extends BaseEntity {
  title: string;
  description: string;
  requirements?: string;
  proposedSupervisorId?: string;
  proposedSupervisor?: User;
  teamMembers?: Array<{
    name: string;
    role: string;
  }>;
  submitterId: string;
  submitter?: User;
  status: "pending_review" | "approved" | "rejected" | "requires_modification";
  reviewNotes?: string;
  reviewedBy?: string;
  reviewer?: User;
  reviewedAt?: string;
  projectId?: string;
  project?: Project;
  studentGroupId?: string;
  studentGroup?: StudentGroup;
  targetProjectId?: string;
  targetProject?: Project;
}

export interface ProjectGroup extends BaseEntity {
  projectId: string;
  project?: Project;
  members: User[];
  leaderId: string;
  leader?: User;
  maxMembers: number;
  groupName?: string;
}

export interface StudentGroup extends BaseEntity {
  name?: string;
  leaderId: string;
  leader?: User;
  members: User[];
  status: "active" | "archived";
  memberCount: number;
  maxMembers: number;
  minMembers: number;
}

export type ProjectRegistrationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export interface ProjectRegistration extends BaseEntity {
  projectId: string;
  project?: Project;
  studentId: string;
  student?: User;
  status: ProjectRegistrationStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewComments?: string;
}

export interface SupervisorNote extends BaseEntity {
  projectId: string;
  project?: Project;
  supervisorId: string;
  supervisor?: User;
  content: string;
  studentReplies?: NoteReply[];
}

export interface NoteReply extends BaseEntity {
  noteId: string;
  authorId: string;
  author?: User;
  content: string;
}

export interface ProjectMilestone extends BaseEntity {
  projectId: string;
  project?: Project;
  title: string;
  description?: string;
  dueDate: string;
  type: "document_submission" | "meeting" | "discussion" | "other";
  completed: boolean;
  completedAt?: string;
}

export interface ProjectMeeting extends BaseEntity {
  projectId: string;
  project?: Project;
  scheduledBy: string;
  scheduledByUser?: User;
  scheduledDate: string;
  duration?: number; // in minutes
  location?: string;
  agenda?: string;
  notes?: string;
  attendees: string[];
}

export type GroupInvitationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled";

export interface GroupInvitation extends BaseEntity {
  groupId: string;
  group?: ProjectGroup;
  inviterId: string;
  inviter?: User;
  inviteeId: string;
  invitee?: User;
  status: GroupInvitationStatus;
  message?: string;
}

export type GroupJoinRequestStatus = "pending" | "approved" | "rejected";

export interface GroupJoinRequest extends BaseEntity {
  groupId: string;
  group?: ProjectGroup;
  studentId: string;
  student?: User;
  status: GroupJoinRequestStatus;
  message?: string;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewer?: User;
  reviewComments?: string;
}
