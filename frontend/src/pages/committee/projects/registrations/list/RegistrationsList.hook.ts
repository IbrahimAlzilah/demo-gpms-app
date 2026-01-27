import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useDataTable } from "@/hooks/useDataTable";
import { registrationService } from "../api/registration.service";
import type {
  RegistrationsListState,
  RegistrationsListData,
} from "./RegistrationsList.types";

export function useRegistrationsList() {
  const { t } = useTranslation();

  const [state, setState] = useState<RegistrationsListState>({
    statusFilter: "all", // Default to 'all' to show all registrations
    selectedRegistration: null,
    action: null,
    comments: "",
    showDialog: false,
    registrationToViewId: null,
    viewMode: "grouped", // Default to 'grouped' view
  });

  const [groupedPagination, setGroupedPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Grouped requests query
  const {
    data: groupedRequestsData,
    isLoading: groupedLoading,
    error: groupedError,
  } = useQuery({
    queryKey: [
      "committee-registrations-grouped",
      state.statusFilter,
      groupedPagination.pageIndex,
      groupedPagination.pageSize,
    ],
    queryFn: async () => {
      try {
        const result = await registrationService.getGroupedRequests({
          status: state.statusFilter !== "all" ? state.statusFilter : undefined,
          page: groupedPagination.pageIndex + 1,
          pageSize: groupedPagination.pageSize,
        });
        return result;
      } catch (error) {
        console.error("Error fetching grouped registration requests:", error);
        throw error;
      }
    },
    enabled: state.viewMode === "grouped",
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 0,
    refetchOnMount: true,
  });

  // Individual registrations query
  const {
    data: registrations,
    totalCount,
    pageCount,
    isLoading,
    error,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    pagination,
    setPagination,
  } = useDataTable({
    queryKey: ["committee-registrations-table", state.statusFilter],
    queryFn: (params) => {
      const filters = { ...params?.filters };
      if (state.statusFilter !== "all") {
        filters.status = state.statusFilter;
      }
      return registrationService.getTableData({ ...params, filters });
    },
    initialPageSize: 10,
    enableServerSide: true,
    enabled: state.viewMode === "individual",
  });

  // Handle undefined data gracefully
  const groupedRequests = groupedRequestsData?.data;
  const groupedPaginationData = groupedRequestsData?.pagination;

  // Log errors for debugging
  if (groupedError && state.viewMode === "grouped") {
    console.error("Grouped registrations fetch error:", groupedError);
  }
  if (error && state.viewMode === "individual") {
    console.error("Individual registrations fetch error:", error);
  }

  const data: RegistrationsListData = {
    registrations: registrations || [],
    isLoading: state.viewMode === "individual" ? isLoading : groupedLoading,
    error: (state.viewMode === "individual"
      ? error
      : groupedError) as Error | null,
    pageCount,
    groupedRequests: Array.isArray(groupedRequests) ? groupedRequests : [],
    groupedPagination: groupedPaginationData,
  };

  return {
    data,
    state,
    setState,
    // Table controls
    totalCount,
    pageCount,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    pagination,
    setPagination,
    groupedPagination,
    setGroupedPagination,
    t,
  };
}
