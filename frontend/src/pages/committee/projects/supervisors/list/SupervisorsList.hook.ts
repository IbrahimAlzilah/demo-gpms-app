import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDataTable } from "@/hooks/useDataTable";
import { useQuery } from "@tanstack/react-query";
import {
  supervisorAssignmentService,
  type SupervisorAssignmentStatus,
} from "../api/supervisor.service";
import type {
  SupervisorsListState,
  SupervisorsListData,
} from "./SupervisorsList.types";
import type { SupervisorAssignmentRow } from "../api/supervisor.service";
import type { Project } from "@/types/project.types";

export type SupervisorAssignmentViewStatus = SupervisorAssignmentStatus | "all";

export function useSupervisorsList() {
  const { t } = useTranslation();
  const [viewStatus, setViewStatus] =
    useState<SupervisorAssignmentViewStatus>("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const {
    data: tableData,
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
  } = useDataTable<SupervisorAssignmentRow>({
    queryKey: ["supervisor-assignment-table", viewStatus],
    queryFn: (params) =>
      supervisorAssignmentService.getAssignmentTable(
        params,
        viewStatus === "all" ? undefined : viewStatus,
      ),
    initialPageSize: 10,
    enableServerSide: true,
  });

  const { data: supervisors } = useQuery({
    queryKey: ["supervisor-available-supervisors"],
    queryFn: () => supervisorAssignmentService.getAvailableSupervisors(),
    staleTime: 0,
    refetchOnMount: true,
  });

  const data: SupervisorsListData = {
    rows: tableData ?? [],
    supervisors: supervisors ?? [],
    isLoading,
    error: error as Error | null,
  };

  const setViewStatusCallback = useCallback(
    (status: SupervisorAssignmentViewStatus) => {
      setViewStatus(status);
    },
    [],
  );

  const state: SupervisorsListState = {
    selectedProject,
    viewStatus,
  };

  const setState = useCallback(
    (
      updater: (prev: SupervisorsListState) => Partial<SupervisorsListState>,
    ) => {
      setSelectedProject((prev) => {
        const next = updater({ selectedProject: prev, viewStatus });
        return next.selectedProject !== undefined ? next.selectedProject : prev;
      });
      setViewStatus((prev) => {
        const next = updater({ selectedProject, viewStatus: prev });
        return next.viewStatus !== undefined ? next.viewStatus : prev;
      });
    },
    [selectedProject, viewStatus],
  );

  return {
    data,
    state: useMemo(() => state, [selectedProject, viewStatus]),
    setState,
    setSelectedProject,
    viewStatus,
    setViewStatus: setViewStatusCallback,
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
    t,
  };
}
