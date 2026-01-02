// Common types shared across the application

export enum UserRole {
  STUDENT = 'student',
  SUPERVISOR = 'supervisor',
  PROJECTS_COMMITTEE = 'projects_committee',
  DISCUSSION_COMMITTEE = 'discussion_committee',
  ADMIN = 'admin',
}

export enum ProposalStatus {
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REQUIRES_MODIFICATION = 'requires_modification',
}

export enum ProjectStatus {
  DRAFT = 'draft',
  ANNOUNCED = 'announced',
  AVAILABLE_FOR_REGISTRATION = 'available_for_registration',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export enum RequestStatus {
  PENDING = 'pending',
  SUPERVISOR_APPROVED = 'supervisor_approved',
  SUPERVISOR_REJECTED = 'supervisor_rejected',
  COMMITTEE_APPROVED = 'committee_approved',
  COMMITTEE_REJECTED = 'committee_rejected',
  CANCELLED = 'cancelled',
}

export enum RequestType {
  CHANGE_SUPERVISOR = 'change_supervisor',
  CHANGE_GROUP = 'change_group',
  CHANGE_PROJECT = 'change_project',
  OTHER = 'other',
}

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
