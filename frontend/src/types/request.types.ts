import type { BaseEntity } from "./common.types";
import type { User } from "./user.types";
import type { Project } from "./project.types";

export type RequestType =
  | "change_supervisor"
  | "change_group"
  | "change_project"
  | "change_project_title"
  | "other";

export type RequestStatus =
  | "pending"
  | "supervisor_approved" // @deprecated Supervisor approval is no longer used. All requests go directly to committee.
  | "supervisor_rejected" // @deprecated Supervisor rejection is no longer used. All requests go directly to committee.
  | "committee_approved"
  | "committee_rejected"
  | "cancelled";

export interface Request extends BaseEntity {
  type: RequestType;
  studentId: string;
  student?: User;
  projectId?: string;
  project?: Project;
  reason: string;
  status: RequestStatus;
  /** @deprecated Supervisor approval is no longer used. Kept for backward compatibility with existing data. */
  supervisorApproval?: {
    approved: boolean;
    comments?: string;
    approvedAt?: string;
    approvedBy?: string;
  };
  committeeApproval?: {
    approved: boolean;
    comments?: string;
    approvedAt?: string;
    approvedBy?: string;
  };
  additionalData?: Record<string, unknown>;
}

export type DocumentType =
  | "proposal"
  | "chapters"
  | "final_report"
  | "code"
  | "presentation"
  | "other";

export interface Document extends BaseEntity {
  type: DocumentType;
  chapterNumber?: number;
  projectId: string;
  project?: Project;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  submittedBy: string;
  submittedByUser?: User;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewStatus: "pending" | "approved" | "rejected";
  reviewComments?: string;
}
