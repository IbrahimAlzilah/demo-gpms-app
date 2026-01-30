import type { Project } from "@/types/project.types";
import type { User } from "@/types/user.types";
import type { Grade } from "@/types/evaluation.types";

// Re-export types from domain types
export type { FinalEvaluationSchema } from "../schema";

/**
 * Evaluation list item (flat student-based view)
 */
export interface EvaluationListItem {
  project: Project;
  student: User;
  hasEvaluation: boolean;
  isLocked?: boolean;
  evaluation?: {
    id: string;
    score: number | null;
    maxScore: number | null;
    supervisorScore?: number | null;
    supervisorMaxScore?: number | null;
    finalGrade?: number | null;
    isApproved: boolean;
    comments?: string | null;
  };
}

/**
 * Evaluation project item (grouped project-based view)
 */
export interface EvaluationProjectItem {
  project: Project;
  studentsCount: number;
  evaluatedCount: number;
  isLocked: boolean;
  evaluationProgress: number;
  phase?: "phase_1" | "phase_2";
  committeeMembers?: Array<{ id: string; name: string }>;
}

/**
 * Committee member info
 */
export interface CommitteeMemberInfo {
  id: string;
  name: string;
  assignedProjectsCount?: number;
}

/**
 * Student grade entry for evaluation form
 */
export interface StudentGradeEntry {
  studentId: string;
  score: string;
  maxScore: string;
  comments: string;
  isLoading?: boolean;
  hasExistingGrade?: boolean;
}

/**
 * Evaluation mode
 */
export type EvaluationMode = "group" | "individual";
