export const TimePeriodType = {
  PROPOSAL_SUBMISSION: 'proposal_submission',
  PROJECT_REGISTRATION: 'project_registration',
  CHAPTER_SUBMISSION_PHASE_1: 'chapter_submission_phase_1',
  FINAL_DEFENSE_PHASE_1: 'final_defense_phase_1',
  CHAPTER_SUBMISSION_PHASE_2: 'chapter_submission_phase_2',
  FINAL_DEFENSE_PHASE_2: 'final_defense_phase_2',
  FINAL_PROJECT_DOCUMENT_SUBMISSION: 'final_project_document_submission',
  GRADE_APPROVAL: 'grade_approval',
  GENERAL: 'general',
} as const;

export type TimePeriodType = typeof TimePeriodType[keyof typeof TimePeriodType];

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
