export enum TimePeriodType {
  PROPOSAL_SUBMISSION = 'proposal_submission',
  PROPOSAL_REVIEW = 'proposal_review',
  PROJECT_REGISTRATION = 'project_registration',
  PROJECT_EXECUTION = 'project_execution',
  DELIVERABLE_SUBMISSION = 'deliverable_submission',
  SUPERVISOR_EVALUATION = 'supervisor_evaluation',
  DISCUSSION_EVALUATION = 'discussion_evaluation',
  GRADE_APPROVAL = 'grade_approval',
}

export interface TimePeriod {
  id: number;
  name: string;
  type: TimePeriodType;
  start_date: string;
  end_date: string;
  is_active: boolean;
  academic_year?: string;
  semester?: string;
  description?: string;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface WindowStatus {
  is_active: boolean;
  window: TimePeriod | null;
  days_remaining: number | null;
}

export interface WindowCheckResponse {
  type: string;
  is_active: boolean;
  window: TimePeriod | null;
  days_remaining: number | null;
}

export interface WindowTypeInfo {
  value: string;
  label: string;
  description: string;
}
