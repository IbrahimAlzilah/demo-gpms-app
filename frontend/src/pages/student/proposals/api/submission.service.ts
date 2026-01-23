import { apiClient } from "../../../../lib/axios";
import type { ProposalSubmission, Proposal } from "../../../../types/project.types";
import type { ProposalFormData } from "../types/Proposals.types";

export const submissionService = {
  getSubmission: async (): Promise<ProposalSubmission | null> => {
    try {
      const response = await apiClient.get<{ success: boolean; data: ProposalSubmission | null }>(
        "/student/proposal-submission"
      );
      return response.data.data || null;
    } catch {
      return null;
    }
  },

  submitProposals: async (
    proposals: ProposalFormData[]
  ): Promise<ProposalSubmission> => {
    const response = await apiClient.post<{ success: boolean; data: ProposalSubmission }>(
      "/student/proposal-submission",
      {
        proposals: proposals.map((proposal) => ({
          title: proposal.title,
          description: proposal.description,
          proposed_supervisor_id: proposal.proposedSupervisorId || null,
          student_group_id: proposal.studentGroupId || null,
          target_project_id: proposal.targetProjectId || null,
          team_members: proposal.teamMembers || [],
        })),
      }
    );
    return response.data.data;
  },

  updateSubmission: async (
    proposals: (ProposalFormData & { id?: string })[]
  ): Promise<ProposalSubmission> => {
    const response = await apiClient.put<{ success: boolean; data: ProposalSubmission }>(
      "/student/proposal-submission",
      {
        proposals: proposals.map((proposal) => ({
          id: proposal.id,
          title: proposal.title,
          description: proposal.description,
          proposed_supervisor_id: proposal.proposedSupervisorId || null,
          target_project_id: proposal.targetProjectId || null,
          team_members: proposal.teamMembers || [],
        })),
      }
    );
    return response.data.data;
  },
};
