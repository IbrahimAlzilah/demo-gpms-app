import { apiClient } from "../../../../../lib/axios";
import type { Project } from "../../../../../types/project.types";
import type { User } from "../../../../../types/user.types";

export interface CommitteeAssignment {
  projectId: string;
  committeeMemberIds: string[];
}

export interface MemberStatistics {
  currentAssignments: number;
  completedProjects: number;
  totalEvaluations: number;
}

export interface CurrentProject {
  id: string;
  title: string;
}

export interface CommitteeMemberProfile extends User {
  department?: string;
  statistics: MemberStatistics;
  currentProjects: CurrentProject[];
  availability: "available" | "moderate" | "busy";
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

export interface ProjectForDiscussion extends Project {
  documentCount: number;
  hasCommitteeAssigned: boolean;
  committeeCount: number;
  evaluationProgress: EvaluationProgress;
  readyForDefensePhase?: "final_defense_1" | "final_defense_2" | null;
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
