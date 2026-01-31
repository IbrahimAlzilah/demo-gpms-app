import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDataTable } from "@/hooks/useDataTable";
import { supervisionService } from "../api/supervision.service";
import type {
  AssignmentRequestsListState,
  AssignmentRequestsListData,
  AssignmentRequestStatusFilter,
} from "./AssignmentRequestsList.types";
import type { SupervisorAssignmentRequest } from "../types/SupervisionRequests.types";

export function useAssignmentRequestsList() {
  const { t } = useTranslation();

  const [state, setState] = useState<AssignmentRequestsListState>({
    statusFilter: "all",
    selectedRequest: null,
    action: null,
    showConfirmDialog: false,
    response: "",
  });

  const {
    data: requests,
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
  } = useDataTable<SupervisorAssignmentRequest>({
    queryKey: ["supervisor-assignment-requests-table", state.statusFilter],
    queryFn: (params) =>
      supervisionService.getTableData(
        params,
        state.statusFilter === "all" ? undefined : state.statusFilter,
      ),
    initialPageSize: 10,
    enableServerSide: true,
  });

  const data: AssignmentRequestsListData = {
    requests: requests ?? [],
    isLoading,
    error: error as Error | null,
    pageCount,
  };

  const setStatusFilter = (statusFilter: AssignmentRequestStatusFilter) => {
    setState((prev) => ({ ...prev, statusFilter }));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return {
    data,
    state,
    setState,
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
    setStatusFilter,
    t,
  };
}
