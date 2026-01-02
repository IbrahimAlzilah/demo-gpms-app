import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/pages/auth/login'
import { createProjectColumns } from './table/columns'
import { useDataTable } from '@/hooks/useDataTable'
import { projectService } from '../api/project.service'
import { DataTable } from '@/components/ui'
import { BlockContent } from '@/components/common'
import { AlertCircle } from 'lucide-react'

export function ProjectList() {
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
    queryKey: ['supervisor-projects-table', user?.id],
    queryFn: (params) => projectService.getTableData(params, user?.id),
    initialPageSize: 10,
    enableServerSide: true,
  })

  const columns = useMemo(
    () =>
      createProjectColumns({
        t,
      }),
    [t]
  )

  if (error) {
    return (
      <BlockContent title={t('nav.projects')}>
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>{t('common.errorLoadingData')}</span>
        </div>
      </BlockContent>
    )
  }

  return (
    <BlockContent title={t('nav.projects')}>
      <DataTable
        columns={columns}
        data={projects || []}
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
        emptyMessage={t('project.noProjects')}
      />
    </BlockContent>
  )
}
