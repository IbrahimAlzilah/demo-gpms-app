import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useDataTable } from '@/hooks/useDataTable'
import { projectService } from '../api/project.service'
import type { ProjectsListState, ProjectsListData } from './ProjectsList.types'

export function useProjectsList() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  
  const [state, setState] = useState<ProjectsListState>({
    selectedProject: null,
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
    queryKey: ['supervisor-projects-table'],
    queryFn: (params) => projectService.getTableData(params, user?.id),
    initialPageSize: 10,
    enableServerSide: true,
  })

  const data: ProjectsListData = {
    projects: projects || [],
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
