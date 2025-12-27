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
} from "@/components/ui/table"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"
import { DataTableViewOptions } from "./data-table-view-options"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { EmptyState } from "@/components/common/EmptyState"
import { useTranslation } from "react-i18next"
import type { DataTableProps } from "./types"

export function DataTable<TData, TValue>({
    columns,
    data,
    isLoading = false,
    error = null,
    pageCount,
    pageIndex = 0,
    pageSize = 10,
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
    loadingMessage,
}: DataTableProps<TData, TValue>) {
    const { t } = useTranslation()
    const defaultEmptyMessage = emptyMessage ?? t('dataTable.emptyMessage')
    const defaultLoadingMessage = loadingMessage ?? t('dataTable.loadingMessage')
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

    // Handle pagination changes
    const paginationState = table.getState().pagination
    const currentPageIndex = paginationState.pageIndex
    const currentPageSize = paginationState.pageSize

    React.useEffect(() => {
        if (onPaginationChange && (currentPageIndex !== pageIndex || currentPageSize !== pageSize)) {
            onPaginationChange(currentPageIndex, currentPageSize)
        }
    }, [currentPageIndex, currentPageSize, onPaginationChange, pageIndex, pageSize])

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
        <div className="space-y-4">
            {(enableFiltering || enableViews) && (
                <div className="flex items-center justify-between">
                    {enableFiltering && (
                        <DataTableToolbar
                            table={table}
                            searchValue={searchValue}
                            onSearchChange={onSearchChange}
                            searchPlaceholder={searchPlaceholder}
                        />
                    )}
                    {enableViews && (
                        <DataTableViewOptions table={table} />
                    )}
                </div>
            )}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
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
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    <LoadingSpinner />
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {defaultLoadingMessage}
                                    </p>
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
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
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    <EmptyState
                                        title={t('dataTable.noResults')}
                                        description={defaultEmptyMessage}
                                    />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <DataTablePagination table={table} />
        </div>
    )
}

