import { apiClient } from "../../../../lib/axios";
import type { Proposal } from "../../../../types/project.types";
import type {
  TableQueryParams,
  TableResponse,
} from "../../../../types/table.types";
import type { ProposalFormData } from "../types/Proposals.types";

export const proposalService = {
  getAll: async (): Promise<Proposal[]> => {
    const response = await apiClient.get<Proposal[]>("/student/proposals");
    return Array.isArray(response.data) ? response.data : [];
  },

  getTableData: async (
    params?: TableQueryParams
  ): Promise<TableResponse<Proposal>> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.pageSize)
      queryParams.append("pageSize", params.pageSize.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          queryParams.append(`filters[${key}]`, String(value));
        }
      });
    }

    const response = await apiClient.get<Proposal[]>(
      `/student/proposals?${queryParams.toString()}`
    );

    return {
      data: Array.isArray(response.data) ? response.data : [],
      totalCount: response.pagination?.total || 0,
      page: response.pagination?.page || 1,
      pageSize: response.pagination?.pageSize || 10,
      totalPages: response.pagination?.totalPages || 0,
    };
  },

  getById: async (id: string): Promise<Proposal | null> => {
    try {
      const response = await apiClient.get<Proposal>(
        `/student/proposals/${id}`
      );
      return response.data;
    } catch {
      return null;
    }
  },

  create: async (
    data: ProposalFormData & { submitterId: string }
  ): Promise<Proposal> => {
    const response = await apiClient.post<Proposal>("/student/proposals", {
      title: data.title,
      description: data.description,
      student_group_id: data.studentGroupId || null,
      target_project_id: data.targetProjectId || null,
    });
    return response.data;
  },

  update: async (id: string, data: Partial<ProposalFormData>): Promise<Proposal> => {
    const response = await apiClient.put<Proposal>(
      `/student/proposals/${id}`,
      {
        title: data.title,
        description: data.description,
        student_group_id: data.studentGroupId || null,
        target_project_id: data.targetProjectId || null,
      }
    );
    return response.data;
  },

  createBatch: async (
    proposals: ProposalFormData[],
    studentGroupId?: string
  ): Promise<Proposal[]> => {
    const response = await apiClient.post<{ data: Proposal[] }>("/student/proposals/batch", {
      student_group_id: studentGroupId || null,
      proposals: proposals.map(p => ({
        title: p.title,
        description: p.description,
        target_project_id: p.targetProjectId || null,
      })),
    });
    return response.data.data || [];
  },

  updateBatch: async (
    updates: Array<{ id: string } & Partial<ProposalFormData>>,
    newProposals: ProposalFormData[],
    studentGroupId?: string
  ): Promise<{ updated: Proposal[]; created: Proposal[] }> => {
    const response = await apiClient.put<{ data: Proposal[] }>("/student/proposals/batch", {
      student_group_id: studentGroupId || null,
      updates: updates.map(u => ({
        id: u.id,
        title: u.title,
        description: u.description,
      })),
      new_proposals: newProposals.map(p => ({
        title: p.title,
        description: p.description,
        target_project_id: p.targetProjectId || null,
      })),
    });
    const allProposals = response.data.data || [];
    // Separate updated and created (we'll need to track this better, but for now assume all are returned)
    return {
      updated: allProposals.filter((_, i) => i < updates.length),
      created: allProposals.filter((_, i) => i >= updates.length),
    };
  },

  getSubmissionContext: async (): Promise<{
    group: any;
    proposals: Proposal[];
    can_edit?: boolean;
    message?: string;
    has_approved_proposal?: boolean;
  }> => {
    const response = await apiClient.get<{
      group: any;
      proposals: Proposal[];
      can_edit?: boolean;
      message?: string;
      has_approved_proposal?: boolean;
    }>("/student/proposals/submission");
    // Axios interceptor already extracts data from { success: true, data: {...} }
    // So response.data is already the nested data object
    return response.data;
  },
};
