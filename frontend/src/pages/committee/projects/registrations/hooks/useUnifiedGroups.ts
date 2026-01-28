import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  registrationService,
  type UnifiedGroup,
} from "../api/registration.service";

export function useUnifiedGroups() {
  const { t } = useTranslation();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const {
    data: unifiedGroupsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "committee-unified-groups",
      statusFilter,
      search,
      projectId,
      pagination.pageIndex,
      pagination.pageSize,
    ],
    queryFn: async () => {
      try {
        const result = await registrationService.getUnifiedGroups({
          status: statusFilter !== "all" ? statusFilter : undefined,
          page: pagination.pageIndex + 1,
          pageSize: pagination.pageSize,
          search: search || undefined,
          project_id: projectId,
        });
        return result;
      } catch (error) {
        console.error("Error fetching unified groups:", error);
        throw error;
      }
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 0,
    refetchOnMount: true,
  });

  const unifiedGroups: UnifiedGroup[] = unifiedGroupsData?.data || [];
  const paginationData = unifiedGroupsData?.pagination;
  const totalCount = paginationData?.total || 0;
  const pageCount = paginationData?.totalPages || 0;

  return {
    unifiedGroups,
    isLoading,
    error: error as Error | null,
    totalCount,
    pageCount,
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
    projectId,
    setProjectId,
    pagination,
    setPagination,
    t,
  };
}
