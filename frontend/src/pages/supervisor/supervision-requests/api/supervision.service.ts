import { apiClient } from "../../../../lib/axios";
import type {
  TableQueryParams,
  TableResponse,
} from "../../../../types/table.types";
import type { SupervisorAssignmentRequest } from "../types/SupervisionRequests.types";

export const supervisionService = {
  getAssignmentRequests: async (
    status?: string,
  ): Promise<SupervisorAssignmentRequest[]> => {
    const params = new URLSearchParams();
    if (
      status &&
      ["pending", "approved", "rejected", "canceled"].includes(status)
    ) {
      params.append("status", status);
    }
    const url = params.toString()
      ? `/supervisor/assignment-requests?${params.toString()}`
      : "/supervisor/assignment-requests";
    const response = await apiClient.get<SupervisorAssignmentRequest[]>(url);
    return Array.isArray(response.data) ? response.data : [];
  },

  getTableData: async (
    params?: TableQueryParams,
    status?: string,
  ): Promise<TableResponse<SupervisorAssignmentRequest>> => {
    const all = await supervisionService.getAssignmentRequests(
      status && ["pending", "approved", "rejected", "canceled"].includes(status)
        ? status
        : undefined,
    );
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 10;
    const start = (page - 1) * pageSize;
    const data = all.slice(start, start + pageSize);
    return {
      data,
      totalCount: all.length,
      page,
      pageSize,
      totalPages: Math.ceil(all.length / pageSize) || 1,
    };
  },

  approveAssignmentRequest: async (
    requestId: number,
    response?: string,
  ): Promise<SupervisorAssignmentRequest> => {
    const res = await apiClient.post<SupervisorAssignmentRequest>(
      `/supervisor/assignment-requests/${requestId}/approve`,
      { response },
    );
    return res.data;
  },

  rejectAssignmentRequest: async (
    requestId: number,
    response: string,
  ): Promise<SupervisorAssignmentRequest> => {
    const res = await apiClient.post<SupervisorAssignmentRequest>(
      `/supervisor/assignment-requests/${requestId}/reject`,
      { response },
    );
    return res.data;
  },
};
