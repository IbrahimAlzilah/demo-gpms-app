import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/pages/auth/login'
import { useDataTable } from '@/hooks/useDataTable'
import { supervisionService } from '../api/supervision.service'
import type { SupervisionRequestsListState, SupervisionRequestsListData } from './SupervisionRequestsList.types'

const MAX_PROJECTS_PER_SUPERVISOR = 5 // This should come from config

export function useSupervisionRequestsList() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  
  const [state, setState] = useState<SupervisionRequestsListState>({
    selectedRequest: null,
    showConfirmDialog: false,
    action: null,
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
    queryKey: ['supervision-requests-table'],
    queryFn: (params) => supervisionService.getTableData(params, user?.id),
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
