import { useState, useMemo } from "react"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import type { SortingState, ColumnFiltersState } from "@tanstack/react-table"
import type { TableQueryOptions, TableResponse } from "../types/table.types"
import { buildTableQueryParams } from "../types/table.types"
import { useTranslation } from "react-i18next"
import { isRTL } from "@/lib/utils/rtl"

export interface UseDataTableOptions<TData> {
  queryKey: string[]
  queryFn: (params: ReturnType<typeof buildTableQueryParams>) => Promise<TableResponse<TData>>
  initialPageSize?: number
  enableServerSide?: boolean
}

export function useDataTable<TData>({
  queryKey,
  queryFn,
  initialPageSize = 10,
  enableServerSide = true,
}: UseDataTableOptions<TData>) {
  const { i18n } = useTranslation()
  const rtl = isRTL()

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: initialPageSize,
  })

  const queryParams = useMemo(() => {
    if (!enableServerSide) return undefined

    const options: TableQueryOptions = {
      page: pagination.pageIndex,
      pageSize: pagination.pageSize,
      sorting,
      columnFilters,
      search: globalFilter,
    }

    return buildTableQueryParams(options)
  }, [pagination, sorting, columnFilters, globalFilter, enableServerSide])

  const {
    data,
    isLoading,
    error,
    isFetching,
  } = useQuery({
    queryKey: [...queryKey, queryParams],
    queryFn: () => queryFn(queryParams!),
    enabled: enableServerSide ? !!queryParams : true,
    placeholderData: keepPreviousData,
  })

  // For server-side, return data as-is
  // For client-side, data would need to be processed here
  const tableData = data

  return {
    data: tableData?.data ?? [],
    totalCount: tableData?.totalCount ?? 0,
    pageCount: tableData?.totalPages ?? 0,
    isLoading: isLoading || isFetching,
    error,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    pagination,
    setPagination,
    rtl,
  }
}

