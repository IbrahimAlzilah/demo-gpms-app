import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useDataTable } from '@/hooks/useDataTable'
import { committeeProjectService } from '../api/project.service'
import type { AnnounceProjectsListState, AnnounceProjectsListData } from './AnnounceProjectsList.types'

export function useAnnounceProjectsList() {
  const { t } = useTranslation()
  
  const [state, setState] = useState<AnnounceProjectsListState>({
    selectedProjects: new Set(),
    viewStatus: 'draft',
    projectToViewId: null,
    projectToRemove: null,
    showRemoveConfirm: false,
  })

  const {
    data: projects,
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
    queryKey: ['committee-projects-announce', state.viewStatus],
    queryFn: (params) => committeeProjectService.getTableData(params, state.viewStatus),
    initialPageSize: 10,
    enableServerSide: true,
  })

  const toggleProject = useCallback((projectId: string) => {
    setState((prev) => {
      const newSelected = new Set(prev.selectedProjects)
      if (newSelected.has(projectId)) {
        newSelected.delete(projectId)
      } else {
        newSelected.add(projectId)
      }
      return { ...prev, selectedProjects: newSelected }
    })
  }, [])

  const data: AnnounceProjectsListData = {
    projects: projects || [],
    isLoading,
    error: error as Error | null,
    pageCount,
  }

  const setViewStatus = useCallback((viewStatus: 'draft' | 'available_for_registration') => {
    setState((prev) => ({ ...prev, viewStatus, selectedProjects: new Set() }))
  }, [])

  return {
    data,
    state,
    setState,
    toggleProject,
    viewStatus: state.viewStatus,
    setViewStatus,
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
