import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDataTable } from '@/hooks/useDataTable'
import { projectService } from '../api/project.service'
import { usePeriodCheck } from '@/hooks/usePeriodCheck'
import type { Project } from '@/types/project.types'
import type { ProjectsListState, ProjectsListData } from './ProjectsList.types'

export function useProjectsList() {
  const { t } = useTranslation()
  const { isPeriodActive, isLoading: periodLoading } = usePeriodCheck('project_registration')

  const [state, setState] = useState<ProjectsListState>({
    selectedProject: null,
    showRegistrationForm: false,
    showDetails: false,
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
    queryKey: ['available-projects-table'],
    queryFn: (params) => {
      // Filter to only available projects
      const filters = { ...params?.filters, status: 'available_for_registration' }
      return projectService.getTableData({ ...params, filters })
    },
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
    isPeriodActive,
    periodLoading,
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
