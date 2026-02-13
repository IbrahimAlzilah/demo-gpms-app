import { apiClient } from "../../../../../lib/axios";
import type { Project } from "../../../../../types/project.types";
import type { User } from "../../../../../types/user.types";

export interface CommitteeAssignment {
  projectId: string;
  committeeMemberIds: string[];
  defenseStage: "FD1" | "FD2";
  defenseScheduledAt?: string | null;
}

export interface MemberProfile {
  department?: string;
  specialization?: string;
  office_location?: string;
  phone?: string;
}

export interface MemberStatistics {
  currentAssignments: number;
  completedProjects: number;
  totalEvaluations: number;
  maxAllowedProjects: number;
  availableSlots: number;
}

export interface ProjectAssignment {
  id: string;
  title: string;
  assigned_at?: string;
  completed_at?: string;
}

export interface PastAssignment {
  project_id: string;
  project_title: string;
  defense_stage: "FD1" | "FD2";
  action: "assigned" | "removed" | "redistributed";
  assigned_at: string;
}

export interface CommitteeMemberProfile extends User {
  profile: MemberProfile;
  statistics: MemberStatistics;
  currentProjects: ProjectAssignment[];
  completedProjects: ProjectAssignment[];
  pastAssignments: PastAssignment[];
  availability: "available" | "moderate" | "busy" | "unavailable";
}

export interface EvaluationProgress {
  evaluated: number;
  total: number;
  percentage: number;
}

export type ProjectFilterStatus =
  | "all"
  | "unassigned"
  | "assigned"
  | "evaluated"
  | "pending_evaluation";

export type DefensePhaseFilter = "all" | "final_defense_1" | "final_defense_2";

export type WorkflowStage =
  | "initial_stage"
  | "document_submission"
  | "committee_evaluation"
  | "grading_completed";

export interface ProjectForDiscussion extends Project {
  documentCount: number;
  hasCommitteeAssigned: boolean;
  committeeCount: number;
  committeeMembers?: Array<{ id: string; name: string }>;
  evaluationProgress: EvaluationProgress;
  readyForDefensePhase?: "final_defense_1" | "final_defense_2" | null;
  workflowStage?: WorkflowStage | null;
  defenseStageDisplay?: string | null;
  defenseScheduledAt?: string | null;
  fd1CommitteePreview?: Array<{ id: string; name: string }> | null;
}

export const committeeDistributionService = {
  /**
   * Get projects ready for discussion with optional filtering
   * defensePhase: 'all' | 'final_defense_1' | 'final_defense_2' – filter by readiness for FD1 or FD2
   */
  getProjectsForDiscussion: async (
    filterStatus?: ProjectFilterStatus,
    search?: string,
    defensePhase?: DefensePhaseFilter,
  ): Promise<ProjectForDiscussion[]> => {
    const params = new URLSearchParams();
    if (filterStatus && filterStatus !== "all") {
      params.append("filter_status", filterStatus);
    }
    if (search) {
      params.append("search", search);
    }
    if (defensePhase && defensePhase !== "all") {
      params.append("defense_phase", defensePhase);
    }
    const url = `/projects-committee/committees/projects${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await apiClient.get<ProjectForDiscussion[]>(url);
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Legacy: Get projects ready for discussion (backward compatibility)
   */
  getProjectsReadyForDiscussion: async (): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>(
      "/projects-committee/projects?status=in_progress",
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Get discussion committee members with detailed profiles and statistics
   */
  getDiscussionCommitteeMembers: async (): Promise<
    CommitteeMemberProfile[]
  > => {
    const response = await apiClient.get<CommitteeMemberProfile[]>(
      "/projects-committee/committees/members",
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Distribute/assign committee members to projects
   */
  distributeProjects: async (
    assignments: CommitteeAssignment[],
  ): Promise<Project[]> => {
    const response = await apiClient.post<Project[]>(
      "/projects-committee/committees/distribute",
      {
        assignments: assignments.map((a) => ({
          project_id: a.projectId,
          committee_member_ids: a.committeeMemberIds,
          defense_stage: a.defenseStage,
          defense_scheduled_at: a.defenseScheduledAt ?? null,
        })),
      },
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Remove committee assignment from a project
   */
  removeAssignment: async (projectId: string): Promise<void> => {
    await apiClient.delete(
      `/projects-committee/committees/projects/${projectId}/assignment`,
    );
  },
};
