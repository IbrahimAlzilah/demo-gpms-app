import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Project } from '@/types/project.types'
import { DataTable } from '@/components/ui/data-table'
import { createProjectColumns } from '../table'
import { useDataTable } from '@/hooks/useDataTable'
import { projectService } from '@/features/student/api/project.service'

interface ProjectBrowserProps {
  onSelectProject?: (project: Project) => void
}

export function ProjectBrowser({ onSelectProject }: ProjectBrowserProps) {
  const { t } = useTranslation()
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

  const columns = useMemo(
    () =>
      createProjectColumns({
        onSelectProject,
        t,
      }),
    [onSelectProject, t]
  )

  return (
    <DataTable
      columns={columns}
      data={projects}
      isLoading={isLoading}
      error={error}
      pageCount={pageCount}
      pageIndex={pagination.pageIndex}
      pageSize={pagination.pageSize}
      onPaginationChange={(pageIndex, pageSize) => {
        setPagination({ pageIndex, pageSize })
      }}
      sorting={sorting}
      onSortingChange={setSorting}
      columnFilters={columnFilters}
      onColumnFiltersChange={setColumnFilters}
      searchValue={globalFilter}
      onSearchChange={setGlobalFilter}
      enableFiltering={true}
      enableViews={true}
      emptyMessage={t('project.noAvailableProjects')}
    />
  )
}
