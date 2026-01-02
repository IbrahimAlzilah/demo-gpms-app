import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDataTable } from '@/hooks/useDataTable'
import { registrationService } from '../api/registration.service'
import type { RegistrationsListState, RegistrationsListData, RegistrationStatusFilter } from './RegistrationsList.types'

export function useRegistrationsList() {
  const { t } = useTranslation()
  
  const [state, setState] = useState<RegistrationsListState>({
    statusFilter: 'pending',
    selectedRegistration: null,
    action: null,
    comments: '',
    showDialog: false,
  })

  const {
    data: registrations,
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
    queryKey: ['committee-registrations-table', state.statusFilter],
    queryFn: (params) => {
      const filters = { ...params?.filters }
      if (state.statusFilter !== 'all') {
        filters.status = state.statusFilter
      }
      return registrationService.getTableData({ ...params, filters })
    },
    initialPageSize: 10,
    enableServerSide: true,
  })

  const data: RegistrationsListData = {
    registrations: registrations || [],
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
