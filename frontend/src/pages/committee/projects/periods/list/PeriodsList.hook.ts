import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDataTable } from '@/hooks/useDataTable'
import { periodService } from '../api/period.service'
import type { TimePeriod } from '@/types/period.types'
import type { PeriodsListState, PeriodsListData } from './PeriodsList.types'

export function usePeriodsList() {
  const { t } = useTranslation()
  
  const [state, setState] = useState<PeriodsListState>({
    showForm: false,
    showDeleteDialog: false,
    selectedPeriod: null,
    success: false,
  })

  const {
    data: periods,
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
    queryKey: ['committee-periods-table'],
    queryFn: (params) => periodService.getTableData(params),
    initialPageSize: 10,
    enableServerSide: true,
  })

  const data: PeriodsListData = {
    periods: periods || [],
    isLoading,
    error: error as Error | null,
    pageCount,
  }

  return {
    data,
    state,
    setState,
    // Table controls
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
  }
}
