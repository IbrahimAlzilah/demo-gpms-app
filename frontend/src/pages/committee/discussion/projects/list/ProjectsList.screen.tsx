import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DataTable } from '@/components/ui'
import { BlockContent } from '@/components/common'
import { AlertCircle } from 'lucide-react'
import { createAssignedProjectColumns } from '../components/AssignedProjectTableColumns'
import { useProjectsList } from './ProjectsList.hook'

export function ProjectsList() {
  const { t } = useTranslation()
  
  const {
    data,
    pageCount,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    pagination,
    setPagination,
  } = useProjectsList()

  const columns = useMemo(
    () =>
      createAssignedProjectColumns({
        t,
      }),
    [t]
  )

  return (
    <>
      <BlockContent title={t('nav.projects')}>
        <DataTable
          columns={columns}
          data={data.projects}
          isLoading={data.isLoading}
          error={data.error}
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
          searchPlaceholder={t('discussion.searchPlaceholder')}
          enableFiltering={true}
          enableViews={true}
          emptyMessage={t('discussion.noProjects')}
        />
      </BlockContent>

      {data.error && (
        <BlockContent variant="container" className="border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{t('discussion.loadError')}</span>
          </div>
        </BlockContent>
      )}
    </>
  )
}
