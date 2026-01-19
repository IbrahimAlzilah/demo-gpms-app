import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDataTable } from '@/hooks/useDataTable'
import { supervisionService } from '../api/supervision.service'
import type { SupervisionRequestsListState, SupervisionRequestsListData } from './SupervisionRequestsList.types'

const MAX_PROJECTS_PER_SUPERVISOR = 5 // This should come from config

export function useSupervisionRequestsList() {
  const { t } = useTranslation()
  
  const [state, setState] = useState<SupervisionRequestsListState>({
    statusFilter: 'all',
    selectedRequest: null,
    showConfirmDialog: false,
    action: null,
    comments: '',
    viewingRequest: null,
  })

  const {
    data: requests,
    totalCount,
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
    queryKey: ['supervision-requests-table', state.statusFilter],
    queryFn: (params) => {
      const filters = { ...params?.filters }
      if (state.statusFilter !== 'all') {
        filters.supervisorApprovalStatus = state.statusFilter
      }
      return supervisionService.getTableData({ ...params, filters })
    },
    initialPageSize: 10,
    enableServerSide: true,
  })

  // In real app, get current project count from API
  const currentProjectCount = 3 // Mock value
  const canAcceptMore = currentProjectCount < MAX_PROJECTS_PER_SUPERVISOR

  const data: SupervisionRequestsListData = {
    requests: requests || [],
    isLoading,
    error: error as Error | null,
    currentProjectCount,
    maxProjectsPerSupervisor: MAX_PROJECTS_PER_SUPERVISOR,
  }

  return {
    data,
    state,
    setState,
    canAcceptMore,
    // Table controls
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
    t,
  }
}
