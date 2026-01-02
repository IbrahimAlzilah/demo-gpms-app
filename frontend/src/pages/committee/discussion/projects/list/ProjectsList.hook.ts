import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/pages/auth/login'
import { useDataTable } from '@/hooks/useDataTable'
import { discussionCommitteeProjectService } from '../api/project.service'
import type { ProjectsListData } from './ProjectsList.types'

export function useProjectsList() {
  const { t } = useTranslation()
  const { user } = useAuthStore()

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
    queryKey: ['discussion-committee-projects-table'],
    queryFn: (params) => discussionCommitteeProjectService.getTableData(params, user?.id),
    initialPageSize: 10,
    enableServerSide: true,
  })

  const data: ProjectsListData = {
    projects: projects || [],
    isLoading,
    error: error as Error | null,
    pageCount,
  }

  return {
    data,
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
