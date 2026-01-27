import type { BaseEntity } from "./common.types";

/**
 * Unified period type matching backend TimePeriodType enum
 */
export type PeriodType =
  | "proposal_submission"
  | "project_registration"
  | "chapter_submission_phase_1"
  | "final_defense_phase_1"
  | "chapter_submission_phase_2"
  | "final_defense_phase_2"
  | "final_project_document_submission"
  | "grade_approval"
  | "general";

export interface TimePeriod extends BaseEntity {
  name: string;
  type: PeriodType;
  startDate: string;
  endDate: string;
  isActive: boolean;
  academicYear?: string;
  semester?: string;
  description?: string;
  createdBy: string;
  creator?: {
    id: string;
    name: string;
    email?: string;
  };
}
