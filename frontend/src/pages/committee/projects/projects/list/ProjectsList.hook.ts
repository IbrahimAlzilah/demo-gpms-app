import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useDataTable } from '@/hooks/useDataTable'
import { committeeProjectService } from '../../announce-projects/api/project.service'
import type { ProjectsListState, ProjectsListData } from './ProjectsList.types'

export function useProjectsList() {
  const { t } = useTranslation()
  
  const [state, setState] = useState<ProjectsListState & { viewStatus: 'all' | 'draft' | 'available_for_registration' | 'in_progress' }>({
    projectToViewId: null,
    viewStatus: 'all',
  })

  const {
    data: projects,
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
    queryKey: ['committee-projects', state.viewStatus],
    queryFn: (params) => committeeProjectService.getTableData(
      params,
      state.viewStatus === 'all' ? undefined : state.viewStatus
    ),
    initialPageSize: 10,
    enableServerSide: true,
  })

  const data: ProjectsListData = {
    projects: projects || [],
    isLoading,
    error: error as Error | null,
  }

  const setViewStatus = useCallback((viewStatus: 'all' | 'draft' | 'available_for_registration' | 'in_progress') => {
    setState((prev) => ({ ...prev, viewStatus }))
  }, [])

  return {
    data,
    state,
    setState,
    viewStatus: state.viewStatus,
    setViewStatus,
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
