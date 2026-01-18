import { apiClient } from "../../../../lib/axios";
import type { ProjectMilestone } from "@/types/project.types";

export interface CreateMilestoneData {
  title: string;
  description?: string;
  due_date: string;
  type: "document_submission" | "meeting" | "discussion" | "other";
}

export interface UpdateMilestoneData {
  title?: string;
  description?: string;
  due_date?: string;
  type?: "document_submission" | "meeting" | "discussion" | "other";
  completed?: boolean;
}

export const milestoneService = {
  getAll: async (projectId: string): Promise<ProjectMilestone[]> => {
    const response = await apiClient.get<{
      success: boolean;
      data: ProjectMilestone[];
    }>(`/supervisor/projects/${projectId}/milestones`);
    return response.data?.data || response.data || [];
  },

  create: async (
    projectId: string,
    data: CreateMilestoneData
  ): Promise<ProjectMilestone> => {
    const response = await apiClient.post<ProjectMilestone>(
      `/supervisor/projects/${projectId}/milestones`,
      data
    );
    return response.data;
  },

  update: async (
    milestoneId: string,
    data: UpdateMilestoneData
  ): Promise<ProjectMilestone> => {
    const response = await apiClient.put<ProjectMilestone>(
      `/supervisor/milestones/${milestoneId}`,
      data
    );
    return response.data;
  },

  delete: async (milestoneId: string): Promise<void> => {
    await apiClient.delete(`/supervisor/milestones/${milestoneId}`);
  },

  markCompleted: async (milestoneId: string): Promise<ProjectMilestone> => {
    const response = await apiClient.post<ProjectMilestone>(
      `/supervisor/milestones/${milestoneId}/complete`
    );
    return response.data;
  },
};
