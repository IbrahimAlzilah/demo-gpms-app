import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { DataTable } from '@/components/ui'
import { BlockContent } from '@/components/common'
import { AlertCircle } from 'lucide-react'
import { createProjectsColumns } from '../components/table'
import { useProjectsList } from './ProjectsList.hook'
import { ROUTES } from '@/lib/constants'
import type { Project } from '@/types/project.types'

export function ProjectsList() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const {
    data,
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
  } = useProjectsList()

  const columns = useMemo(
    () =>
      createProjectsColumns({
        t,
        onView: (project: Project) => navigate(ROUTES.DISCUSSION_COMMITTEE.PROJECT_DETAIL(project.id)),
      }),
    [t, navigate]
  )

  return (
    <>
      <BlockContent title={t('nav.projects')} variant="data-table">
        <DataTable
          columns={columns}
          data={data.projects}
          isLoading={data.isLoading}
          error={data.error}
          pageCount={pageCount}
          totalCount={totalCount}
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
