import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useDataTable } from '@/hooks/useDataTable'
import { requestService } from '@/features/student/api/request.service'
import type { Request } from '@/types/request.types'
import type { RequestStatistics } from '../types/Requests.types'
import type { RequestsListState, RequestsListData } from './RequestsList.types'

export function useRequestsList() {
  const { t } = useTranslation()
  const { user } = useAuthStore()

  const [state, setState] = useState<RequestsListState>({
    selectedRequest: null,
    showForm: false,
    requestToCancel: null,
    showCancelDialog: false,
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
    queryKey: ['student-requests-table'],
    queryFn: (params) => requestService.getTableData(params, user?.id),
    initialPageSize: 10,
    enableServerSide: true,
  })

  // Calculate statistics
  const statistics = useMemo<RequestStatistics>(() => {
    if (!requests) return { total: 0, pending: 0, approved: 0, rejected: 0 }

    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === 'pending').length,
      approved: requests.filter((r) => r.status === 'committee_approved').length,
      rejected: requests.filter((r) => r.status === 'committee_rejected' || r.status === 'supervisor_rejected').length,
    }
  }, [requests])

  const data: RequestsListData = {
    requests: requests || [],
    statistics,
    isLoading,
    error: error as Error | null,
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
