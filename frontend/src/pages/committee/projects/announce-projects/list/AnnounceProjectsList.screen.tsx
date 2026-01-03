import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAnnounceProjects } from '../hooks/useProjectAnnouncement'
import { DataTable, Button } from '@/components/ui'
import { BlockContent, useToast } from '@/components/common'
import { createProjectAnnouncementColumns } from '../components/ProjectAnnouncementTableColumns'
import { Loader2, Megaphone, AlertCircle } from 'lucide-react'
import { useAnnounceProjectsList } from './AnnounceProjectsList.hook'

export function AnnounceProjectsList() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const announceProjects = useAnnounceProjects()
  
  const {
    data,
    state,
    setState,
    toggleProject,
    pageCount,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    pagination,
    setPagination,
  } = useAnnounceProjectsList()

  const handleAnnounce = async () => {
    if (state.selectedProjects.size === 0) {
      showToast(t('committee.announce.selectAtLeastOne'), 'warning')
      return
    }

    try {
      await announceProjects.mutateAsync(Array.from(state.selectedProjects))
      showToast(t('committee.announce.success'), 'success')
      setState((prev) => ({ ...prev, selectedProjects: new Set() }))
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : t('committee.announce.error'),
        'error'
      )
    }
  }

  const columns = useMemo(
    () =>
      createProjectAnnouncementColumns({
        selectedProjects: state.selectedProjects,
        onToggleProject: toggleProject,
        t,
      }),
    [state.selectedProjects, toggleProject, t]
  )

  const headerActions = (
    <div className="flex items-center gap-4">
      <div className="text-sm text-muted-foreground">
        {t('committee.announce.selectedCount', { count: state.selectedProjects.size })}
      </div>
      <Button
        onClick={handleAnnounce}
        disabled={state.selectedProjects.size === 0 || announceProjects.isPending}
      >
        {announceProjects.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('committee.announce.announcing')}
          </>
        ) : (
          <>
            <Megaphone className="mr-2 h-4 w-4" />
            {t('committee.announce.announceSelected')}
          </>
        )}
      </Button>
    </div>
  )

  return (
    <>
      <BlockContent
        title={t('committee.announce.approvedProjects')}
        actions={headerActions}
      >
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
          // searchPlaceholder={t('committee.announce.searchPlaceholder')}
          enableFiltering={true}
          enableViews={true}
          emptyMessage={t('committee.announce.noProjects')}
        />
      </BlockContent>

      {data.error && (
        <BlockContent variant="container" className="border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{t('committee.announce.loadError') || 'حدث خطأ أثناء تحميل المشاريع'}</span>
          </div>
        </BlockContent>
      )}
    </>
  )
}
