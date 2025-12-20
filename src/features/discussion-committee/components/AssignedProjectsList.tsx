import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../auth/store/auth.store'
import type { Project } from '../../../types/project.types'
import { createAssignedProjectColumns } from './AssignedProjectTableColumns'
import { useDataTable } from '@/hooks/useDataTable'
import { discussionCommitteeProjectService } from '../api/project.service'
import { DataTable } from '@/components/ui'
import { BlockContent } from '@/components/common'
import { AlertCircle } from 'lucide-react'

export function AssignedProjectsList() {
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
    rtl,
  } = useDataTable({
    queryKey: ['discussion-committee-projects-table'],
    queryFn: (params) => discussionCommitteeProjectService.getTableData(params, user?.id),
    initialPageSize: 10,
    enableServerSide: true,
  })

  const columns = useMemo(
    () =>
      createAssignedProjectColumns({
        rtl,
      }),
    [rtl]
  )

  return (
    <>
      <BlockContent title={t('nav.projects') || 'استعراض المشاريع'}>
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
          searchPlaceholder={t('discussion.searchPlaceholder') || 'البحث في المشاريع...'}
          rtl={rtl}
          enableFiltering={true}
          enableViews={true}
          emptyMessage={t('discussion.noProjects') || 'لا توجد مشاريع معينة لك حالياً'}
        />
      </BlockContent>

      {error && (
        <BlockContent variant="container" className="border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{t('discussion.loadError') || 'حدث خطأ أثناء تحميل المشاريع'}</span>
          </div>
        </BlockContent>
      )}
    </>
  )
}

