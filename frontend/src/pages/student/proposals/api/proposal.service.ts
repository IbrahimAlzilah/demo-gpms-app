import { apiClient } from "../../../../lib/axios";
import type { Proposal } from "../../../../types/project.types";
import type {
  TableQueryParams,
  TableResponse,
} from "../../../../types/table.types";

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

    const response = await apiClient.get<{ data: Proposal[]; pagination: any }>(
      `/student/proposals?${queryParams.toString()}`
    );

    return {
      data: response.data || [],
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
    data: Omit<Proposal, "id" | "createdAt" | "updatedAt" | "status">
  ): Promise<Proposal> => {
    const response = await apiClient.post<Proposal>("/student/proposals", {
      title: data.title,
      description: data.description,
      objectives: data.objectives,
      methodology: data.methodology,
      expected_outcomes: data.expectedOutcomes,
    });
    return response.data;
  },

  update: async (id: string, data: Partial<Proposal>): Promise<Proposal> => {
    const response = await apiClient.put<{ success: boolean; data: Proposal; message?: string }>(
      `/student/proposals/${id}`,
      {
        title: data.title,
        description: data.description,
        objectives: data.objectives,
        methodology: data.methodology,
        expected_outcomes: data.expectedOutcomes,
      }
    );
    // Handle both response structures (wrapped or unwrapped)
    return response.data?.data || response.data;
  },
};
