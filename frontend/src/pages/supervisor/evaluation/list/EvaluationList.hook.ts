import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import type { SortingState, ColumnFiltersState } from "@tanstack/react-table";
import { evaluationService } from "../api/evaluation.service";
import type {
  SupervisorEvaluationListState,
  SupervisorEvaluationListData,
} from "./EvaluationList.types";

const DEFAULT_PAGE_SIZE = 10;

export function useSupervisorEvaluationList() {
  const { t } = useTranslation();
  const [state, setState] = useState<SupervisorEvaluationListState>({
    selectedProjectId: null,
    showEvaluationModal: false,
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const {
    data: projectItems,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["supervisor-evaluation-projects"],
    queryFn: () => evaluationService.getProjects(),
    staleTime: 0,
    refetchOnMount: true,
  });

  const filteredItems = useMemo(() => {
    if (!projectItems) return [];
    if (!globalFilter.trim()) return projectItems;
    const q = globalFilter.toLowerCase();
    return projectItems.filter(
      (item) =>
        item.project.title.toLowerCase().includes(q) ||
        item.project.description?.toLowerCase().includes(q) ||
        item.project.supervisor?.name?.toLowerCase().includes(q),
    );
  }, [projectItems, globalFilter]);

  const sortedItems = useMemo(() => {
    const sorted = [...filteredItems];
    const sort = sorting[0];
    if (!sort) return sorted;
    if (sort.id === "project.title") {
      sorted.sort((a, b) =>
        sort.desc
          ? b.project.title.localeCompare(a.project.title)
          : a.project.title.localeCompare(b.project.title),
      );
    }
    if (sort.id === "evaluationProgress") {
      sorted.sort((a, b) =>
        sort.desc
          ? b.evaluationProgress - a.evaluationProgress
          : a.evaluationProgress - b.evaluationProgress,
      );
    }
    return sorted;
  }, [filteredItems, sorting]);

  const totalCount = sortedItems.length;
  const pageCount = Math.ceil(totalCount / pagination.pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    return sortedItems.slice(start, start + pagination.pageSize);
  }, [sortedItems, pagination.pageIndex, pagination.pageSize]);

  const data: SupervisorEvaluationListData = {
    items: paginatedItems,
    isLoading,
    error: error as Error | null,
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
    refetch,
    t,
  };
}
