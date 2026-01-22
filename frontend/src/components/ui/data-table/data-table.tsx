import * as React from "react"
import {
  // type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Skeleton
} from "@/components/ui"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"
import { DataTableViewOptions } from "./data-table-view-options"
import { EmptyState } from "@/components/common/EmptyState"
import { useTranslation } from "react-i18next"
import emptyDataImage from "@/assets/images/empty-data.svg"
import type { DataTableProps } from "./types"

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  error = null,
  pageCount,
  pageIndex = 0,
  pageSize = 10,
  totalCount,
  onPaginationChange,
  sorting,
  onSortingChange,
  enableSorting = true,
  columnFilters,
  onColumnFiltersChange,
  enableFiltering = true,
  columnVisibility,
  onColumnVisibilityChange,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  enableViews = true,
  emptyMessage,
  toolbarContent,
}: DataTableProps<TData, TValue>) {
  const { t } = useTranslation()
  const defaultEmptyMessage = emptyMessage ?? t('dataTable.emptyMessage')
  const [internalSorting, setInternalSorting] = React.useState<SortingState>([])
  const [internalColumnFilters, setInternalColumnFilters] =
    React.useState<ColumnFiltersState>([])
  const [internalColumnVisibility, setInternalColumnVisibility] =
    React.useState<VisibilityState>({})

  // Use external state if provided, otherwise use internal state
  const currentSorting = sorting ?? internalSorting
  const currentColumnFilters = columnFilters ?? internalColumnFilters
  const currentColumnVisibility = columnVisibility ?? internalColumnVisibility

  const handleSortingChange = (updater: SortingState | ((old: SortingState) => SortingState)) => {
    const newSorting = typeof updater === "function" ? updater(currentSorting) : updater
    if (onSortingChange) {
      onSortingChange(newSorting)
    } else {
      setInternalSorting(newSorting)
    }
  }

  const handleColumnFiltersChange = (updater: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => {
    const newFilters = typeof updater === "function" ? updater(currentColumnFilters) : updater
    if (onColumnFiltersChange) {
      onColumnFiltersChange(newFilters)
    } else {
      setInternalColumnFilters(newFilters)
    }
  }

  const handleColumnVisibilityChange = (updater: VisibilityState | ((old: VisibilityState) => VisibilityState)) => {
    const newVisibility = typeof updater === "function" ? updater(currentColumnVisibility) : updater
    if (onColumnVisibilityChange) {
      onColumnVisibilityChange(newVisibility)
    } else {
      setInternalColumnVisibility(newVisibility)
    }
  }

  const handlePaginationChange = React.useCallback((updater: any) => {
    if (!onPaginationChange) return

    const currentPagination = { pageIndex, pageSize }
    const newPagination = typeof updater === "function"
      ? updater(currentPagination)
      : updater

    // Only call onPaginationChange if values actually changed
    if (newPagination.pageIndex !== pageIndex || newPagination.pageSize !== pageSize) {
      onPaginationChange(newPagination.pageIndex, newPagination.pageSize)
    }
  }, [onPaginationChange, pageIndex, pageSize])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onPaginationChange: onPaginationChange ? handlePaginationChange : undefined,
    manualPagination: !!onPaginationChange,
    manualSorting: !!onSortingChange,
    manualFiltering: !!onColumnFiltersChange,
    pageCount: pageCount ?? -1,
    state: {
      sorting: currentSorting,
      columnFilters: currentColumnFilters,
      columnVisibility: currentColumnVisibility,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    enableSorting,
  })

  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-center">
        <p className="text-sm text-destructive">
          {t('dataTable.errorMessage')}: {error.message}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {(enableFiltering || enableViews || toolbarContent) && (
        <div className="flex-none flex items-center justify-between gap-4 p-3 border-b">
          <div className="flex items-center flex-1 gap-2">
            {enableFiltering && (
              <DataTableToolbar
                table={table}
                searchValue={searchValue}
                onSearchChange={onSearchChange}
                searchPlaceholder={searchPlaceholder}
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            {toolbarContent}
            {enableViews && (
              <DataTableViewOptions table={table} />
            )}
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-auto 1bg-background">
        <Table className="w-full">
          <TableHeader className="sticky top-0 z-40 bg-muted border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="whitespace-nowrap py-1.5 px-2 h-11 font-semibold text-foreground/70 bg-background"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Skeleton loading rows - match table structure
              Array.from({ length: pageSize || 10 }).map((_, index) => (
                <TableRow
                  key={`skeleton-${index}`}
                  className="border-b"
                >
                  {table.getVisibleFlatColumns().map((_, colIndex) => (
                    <TableCell
                      key={`skeleton-cell-${index}-${colIndex}`}
                      className="whitespace-nowrap py-1.5 px-2"
                    >
                      <Skeleton className="h-7 w-full max-w-full rounded-[.375rem]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b data-[state=selected]:bg-muted"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="whitespace-nowrap py-1.5 px-2"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="border-b hover:bg-muted/20">
                <TableCell
                  colSpan={columns.length}
                  className="text-center align-middle py-12"
                >
                  <div className="flex flex-col items-center justify-center">
                    <EmptyState
                      image={emptyDataImage}
                      // title={defaultEmptyMessage}
                      description={defaultEmptyMessage}
                    />
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex-none border-t bg-muted/20">
        <DataTablePagination table={table} totalCount={totalCount} />
      </div>
    </div>
  )
}

