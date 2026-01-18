// Common types shared across the application

export const UserRole = {
  STUDENT: 'student',
  SUPERVISOR: 'supervisor',
  PROJECTS_COMMITTEE: 'projects_committee',
  DISCUSSION_COMMITTEE: 'discussion_committee',
  ADMIN: 'admin',
} as const

export type UserRole = typeof UserRole[keyof typeof UserRole]

export const ProposalStatus = {
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REQUIRES_MODIFICATION: 'requires_modification',
} as const

export type ProposalStatus = typeof ProposalStatus[keyof typeof ProposalStatus]

export const ProjectStatus = {
  DRAFT: 'draft',
  ANNOUNCED: 'announced',
  AVAILABLE_FOR_REGISTRATION: 'available_for_registration',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
} as const

export type ProjectStatus = typeof ProjectStatus[keyof typeof ProjectStatus]

/**
 * Request status
 * @deprecated SUPERVISOR_APPROVED and SUPERVISOR_REJECTED are no longer used.
 * All requests now go directly to Projects Committee. These values are kept for backward compatibility.
 */
export const RequestStatus = {
  PENDING: 'pending',
  /** @deprecated Supervisor approval is no longer used */
  SUPERVISOR_APPROVED: 'supervisor_approved',
  /** @deprecated Supervisor rejection is no longer used */
  SUPERVISOR_REJECTED: 'supervisor_rejected',
  COMMITTEE_APPROVED: 'committee_approved',
  COMMITTEE_REJECTED: 'committee_rejected',
  CANCELLED: 'cancelled',
} as const

export type RequestStatus = typeof RequestStatus[keyof typeof RequestStatus]

export const RequestType = {
  CHANGE_SUPERVISOR: 'change_supervisor',
  CHANGE_GROUP: 'change_group',
  CHANGE_PROJECT: 'change_project',
  OTHER: 'other',
} as const

export type RequestType = typeof RequestType[keyof typeof RequestType]

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  student_id?: string;
  emp_id?: string;
  department?: string;
  phone?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

export interface TableQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  filters?: Record<string, any>;
}
