import { apiClient } from "../../../../../lib/axios";
import type { Project } from "../../../../../types/project.types";
import type {
  TableQueryParams,
  TableResponse,
} from "../../../../../types/table.types";

export const discussionCommitteeProjectService = {
  getAssignedProjects: async (
    _committeeMemberId: string,
  ): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>(
      "/discussion-committee/projects",
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  getTableData: async (
    params?: TableQueryParams,
    _committeeMemberId?: string,
  ): Promise<TableResponse<Project>> => {
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

    const response = await apiClient.get<Project[]>(
      `/discussion-committee/projects?${queryParams.toString()}`,
    );

    return {
      data: Array.isArray(response.data) ? response.data : [],
      totalCount: response.pagination?.total || 0,
      page: response.pagination?.page || 1,
      pageSize: response.pagination?.pageSize || 10,
      totalPages: response.pagination?.totalPages || 0,
    };
  },

  getById: async (id: string): Promise<Project | null> => {
    try {
      const response = await apiClient.get<Project>(
        `/discussion-committee/projects/${id}`,
      );
      return response.data;
    } catch {
      return null;
    }
  },

  /** Download document (blob with auth); call from UI to trigger file save */
  downloadDocument: async (
    projectId: string,
    documentId: string,
    fileName?: string,
  ): Promise<void> => {
    const token = localStorage.getItem("token");
    const base = import.meta.env.VITE_API_BASE_URL || "/api";
    const url = `${base}/discussion-committee/projects/${projectId}/documents/${documentId}/download`;
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok)
      throw new Error(res.status === 403 ? "Unauthorized" : "Download failed");
    const blob = await res.blob();
    const name =
      fileName ||
      res.headers
        .get("Content-Disposition")
        ?.match(/filename="?([^"]+)"?/)?.[1] ||
      "document";
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  },
};
