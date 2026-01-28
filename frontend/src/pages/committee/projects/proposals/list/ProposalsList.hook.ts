import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDataTable } from "@/hooks/useDataTable";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import type { SortingState, ColumnFiltersState } from "@tanstack/react-table";
import { committeeProposalService } from "../api/proposal.service";
import {
  registrationService,
  type UnifiedGroup,
} from "../../registrations/api/registration.service";
import type {
  ProposalsListState,
  ProposalsListData,
} from "./ProposalsList.types";
import type { Submission } from "../types/GroupedSubmissions.types";
import { buildTableQueryParams } from "@/types/table.types";

export function useProposalsList() {
  const { t } = useTranslation();

  const [state, setState] = useState<ProposalsListState>({
    selectedProposal: null,
    action: null,
    statusFilter: "all",
    proposalToEditId: null,
    proposalToDelete: null,
    proposalToViewId: null,
    viewMode: "grouped", // Default to grouped view
    registrationDetails: [],
    showRegistrationWarning: false,
  });

  // Shared pagination and filter state for grouped view
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState<string>("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const isGroupedView = state.viewMode === "grouped";

  // Individual proposals table (for individual view)
  const {
    data: proposals,
    totalCount: proposalsTotalCount,
    pageCount: proposalsPageCount,
    isLoading: proposalsLoading,
    error: proposalsError,
    sorting: proposalsSorting,
    setSorting: setProposalsSorting,
    columnFilters: proposalsColumnFilters,
    setColumnFilters: setProposalsColumnFilters,
    globalFilter: proposalsGlobalFilter,
    setGlobalFilter: setProposalsGlobalFilter,
    pagination: proposalsPagination,
    setPagination: setProposalsPagination,
  } = useDataTable({
    queryKey: ["committee-proposals-table", state.statusFilter],
    queryFn: (params) =>
      committeeProposalService.getTableData(
        params,
        state.statusFilter === "all" ? undefined : state.statusFilter,
      ),
    initialPageSize: 10,
    enableServerSide: true,
  });

  // Unified groups query (student groups with proposals + registrations)
  const unifiedGroupsQueryParams = useMemo(() => {
    if (!isGroupedView) return undefined;
    return {
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      search: globalFilter,
      status: state.statusFilter !== "all" ? state.statusFilter : undefined,
      project_id: projectFilter || undefined,
    };
  }, [
    isGroupedView,
    pagination.pageIndex,
    pagination.pageSize,
    globalFilter,
    state.statusFilter,
    projectFilter,
  ]);

  const {
    data: unifiedGroupsData,
    isLoading: unifiedGroupsLoading,
    error: unifiedGroupsError,
  } = useQuery({
    queryKey: [
      "committee-unified-groups",
      state.statusFilter,
      globalFilter,
      unifiedGroupsQueryParams,
    ],
    queryFn: async () => {
      if (!unifiedGroupsQueryParams) {
        return {
          data: [],
          pagination: {
            page: 1,
            pageSize: 10,
            total: 0,
            totalPages: 0,
          },
        };
      }
      return registrationService.getUnifiedGroups(unifiedGroupsQueryParams);
    },
    enabled: isGroupedView && !!unifiedGroupsQueryParams,
    placeholderData: keepPreviousData,
    staleTime: 0,
    refetchOnMount: true,
  });

  // Supervisor proposals query (separate from student groups)
  const supervisorSubmissionsQueryParams = useMemo(() => {
    if (!isGroupedView) return undefined;
    return buildTableQueryParams({
      page: pagination.pageIndex,
      pageSize: pagination.pageSize,
      search: globalFilter,
    });
  }, [isGroupedView, pagination.pageIndex, pagination.pageSize, globalFilter]);

  const {
    data: supervisorSubmissionsData,
    isLoading: supervisorSubmissionsLoading,
    error: supervisorSubmissionsError,
  } = useQuery({
    queryKey: [
      "committee-proposals-supervisor-submissions",
      state.statusFilter,
      globalFilter,
      supervisorSubmissionsQueryParams,
    ],
    queryFn: async () => {
      if (!supervisorSubmissionsQueryParams) {
        return {
          data: [],
          totalCount: 0,
          page: 1,
          pageSize: 10,
          totalPages: 0,
        };
      }
      // Get all submissions and filter for supervisor-only
      const allSubmissions =
        await committeeProposalService.getSubmissionsTableData(
          supervisorSubmissionsQueryParams,
          state.statusFilter === "all" ? undefined : state.statusFilter,
          globalFilter || undefined,
        );
      // Filter to only supervisor submissions
      const supervisorSubmissions = allSubmissions.data.filter(
        (submission) => submission.origin === "supervisor",
      );
      return {
        ...allSubmissions,
        data: supervisorSubmissions,
        totalCount: supervisorSubmissions.length,
      };
    },
    enabled: isGroupedView && !!supervisorSubmissionsQueryParams,
    placeholderData: keepPreviousData,
    staleTime: 0,
    refetchOnMount: true,
  });

  // Sync pagination and filters between views
  // When switching views, maintain the same pagination state
  const currentSorting = isGroupedView ? sorting : proposalsSorting;
  const currentSetSorting = isGroupedView ? setSorting : setProposalsSorting;
  const currentColumnFilters = isGroupedView
    ? columnFilters
    : proposalsColumnFilters;
  const currentSetColumnFilters = isGroupedView
    ? setColumnFilters
    : setProposalsColumnFilters;
  const currentGlobalFilter = isGroupedView
    ? globalFilter
    : proposalsGlobalFilter;
  const currentSetGlobalFilter = isGroupedView
    ? setGlobalFilter
    : setProposalsGlobalFilter;
  const currentPagination = isGroupedView ? pagination : proposalsPagination;
  const currentSetPagination = isGroupedView
    ? setPagination
    : setProposalsPagination;

  // Determine which data to use based on view mode
  const isLoading = isGroupedView
    ? unifiedGroupsLoading || supervisorSubmissionsLoading
    : proposalsLoading;
  const error = isGroupedView
    ? unifiedGroupsError || supervisorSubmissionsError
    : proposalsError;

  const unifiedGroups: UnifiedGroup[] = isGroupedView
    ? unifiedGroupsData?.data || []
    : [];
  const supervisorSubmissions: Submission[] = isGroupedView
    ? supervisorSubmissionsData?.data || []
    : [];

  const totalCount = isGroupedView
    ? (unifiedGroupsData?.pagination?.total || 0) +
      (supervisorSubmissionsData?.totalCount || 0)
    : proposalsTotalCount;
  const pageCount = isGroupedView
    ? Math.max(
        unifiedGroupsData?.pagination?.totalPages || 0,
        supervisorSubmissionsData?.totalPages || 0,
      )
    : proposalsPageCount;

  const data: ProposalsListData = {
    proposals: proposals || [],
    submissions: supervisorSubmissions as Submission[],
    unifiedGroups: unifiedGroups,
    isLoading,
    error: error as Error | null,
    pageCount,
  };

  return {
    data,
    state,
    setState,
    // Table controls - use current view's state
    totalCount,
    pageCount,
    sorting: currentSorting,
    setSorting: currentSetSorting,
    columnFilters: currentColumnFilters,
    setColumnFilters: currentSetColumnFilters,
    globalFilter: currentGlobalFilter,
    setGlobalFilter: currentSetGlobalFilter,
    projectFilter,
    setProjectFilter,
    pagination: currentPagination,
    setPagination: currentSetPagination,
    t,
  };
}
