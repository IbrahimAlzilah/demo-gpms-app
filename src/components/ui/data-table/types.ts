import type { ColumnDef, SortingState, ColumnFiltersState, VisibilityState } from "@tanstack/react-table"

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean
  error?: Error | null
  // Pagination
  pageCount?: number
  pageIndex?: number
  pageSize?: number
  onPaginationChange?: (pageIndex: number, pageSize: number) => void
  // Sorting
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
  enableSorting?: boolean
  // Filtering
  columnFilters?: ColumnFiltersState
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void
  enableFiltering?: boolean
  // Column visibility
  columnVisibility?: VisibilityState
  onColumnVisibilityChange?: (visibility: VisibilityState) => void
  // Search
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  // Custom views
  enableViews?: boolean
  defaultView?: string
  onViewChange?: (viewId: string) => void
  // Empty state
  emptyMessage?: string
  // Loading state
  loadingMessage?: string
}

export interface TableView {
  id: string
  name: string
  columns: string[]
  filters?: Record<string, any>
  sorting?: SortingState
  columnVisibility?: VisibilityState
}

export interface DataTablePaginationState {
  pageIndex: number
  pageSize: number
}

export interface DataTableFilter {
  id: string
  value: unknown
}

