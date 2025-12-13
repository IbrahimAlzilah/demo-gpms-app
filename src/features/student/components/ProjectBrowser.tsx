import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Project } from '../../../types/project.types'
import { DataTable } from '@/components/ui/data-table'
import { createProjectColumns } from './ProjectTableColumns'
import { useDataTable } from '@/hooks/useDataTable'
import { projectService } from '../api/project.service'

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
    rtl,
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
        rtl,
      }),
    [onSelectProject, rtl]
  )

  return (
    <div className="space-y-4">
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
        searchPlaceholder={t('project.searchPlaceholder') || 'البحث في المشاريع...'}
        rtl={rtl}
        enableFiltering={true}
        enableViews={true}
        emptyMessage={t('project.noAvailableProjects') || 'لا توجد مشاريع متاحة للتسجيل حالياً'}
      />
    </div>
  )
}

