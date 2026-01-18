import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDataTable } from '@/hooks/useDataTable'
import { userService } from '../api/user.service'
// import type { User } from '@/types/user.types'
import type { UsersListState, UsersListData } from './UsersList.types'

export function useUsersList() {
  const { t } = useTranslation()

  const [state, setState] = useState<UsersListState>({
    selectedUser: null,
    showForm: false,
    userToDelete: null,
    showDeleteDialog: false,
  })

  const {
    data: users,
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
    queryKey: ['admin-users-table'],
    queryFn: (params) => userService.getTableData(params),
    initialPageSize: 10,
    enableServerSide: true,
  })

  const data: UsersListData = {
    users: users || [],
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
