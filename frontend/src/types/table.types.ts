import type { SortingState, ColumnFiltersState } from "@tanstack/react-table";

export interface TableQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: Record<string, unknown>;
  search?: string;
}

export interface TableResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TableQueryOptions {
  page?: number;
  pageSize?: number;
  sorting?: SortingState;
  columnFilters?: ColumnFiltersState;
  search?: string;
}

export function buildTableQueryParams(
  options: TableQueryOptions
): TableQueryParams {
  const params: TableQueryParams = {
    page: (options.page ?? 0) + 1, // Convert 0-based to 1-based for API
    pageSize: options.pageSize ?? 10,
  };

  // Add sorting
  if (options.sorting && options.sorting.length > 0) {
    const sort = options.sorting[0];
    params.sortBy = sort.id;
    params.sortOrder = sort.desc ? "desc" : "asc";
  }

  // Add search
  if (options.search) {
    params.search = options.search;
  }

  // Add filters
  if (options.columnFilters && options.columnFilters.length > 0) {
    const filters: Record<string, unknown> = {};
    options.columnFilters.forEach((filter) => {
      if (
        filter.value !== undefined &&
        filter.value !== null &&
        filter.value !== ""
      ) {
        filters[filter.id] = filter.value;
      }
    });
    if (Object.keys(filters).length > 0) {
      params.filters = filters;
    }
  }

  return params;
}
