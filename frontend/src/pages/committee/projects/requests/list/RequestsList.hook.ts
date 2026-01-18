import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDataTable } from '@/hooks/useDataTable'
import { committeeRequestService } from '../api/request.service'
import type { RequestsListState, RequestsListData } from './RequestsList.types'

export function useRequestsList() {
  const { t } = useTranslation()
  
  const [state, setState] = useState<RequestsListState>({
    statusFilter: 'all',
    selectedRequest: null,
    action: null,
    showConfirmDialog: false,
    comments: '',
  })

  const {
    data: requests,
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
    queryKey: ['committee-requests-table', state.statusFilter],
    queryFn: (params) => {
      const filters = { ...params?.filters }
      if (state.statusFilter !== 'all') {
        filters.status = state.statusFilter
      }
      return committeeRequestService.getTableData({ ...params, filters })
    },
    initialPageSize: 10,
    enableServerSide: true,
  })

  const data: RequestsListData = {
    requests: requests || [],
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
