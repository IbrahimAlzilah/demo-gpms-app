import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAnnounceProjects as useAnnounceProjectsOperation } from '../hooks/useAnnounceProjectsOperations'
import { DataTable, Button, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui'
import { BlockContent, useToast } from '@/components/common'
import { createAnnounceProjectsColumns } from '../components/table'
import { Loader2, Megaphone, AlertCircle } from 'lucide-react'
import { useAnnounceProjectsList } from './AnnounceProjectsList.hook'

export function AnnounceProjectsList() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const announceProjectsOperation = useAnnounceProjectsOperation()

  const {
    data,
    state,
    setState,
    toggleProject,
    viewStatus,
    setViewStatus,
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
      await announceProjectsOperation.mutateAsync(Array.from(state.selectedProjects))
      showToast(t('committee.announce.success'), 'success')
      setState((prev) => ({ ...prev, selectedProjects: new Set() }))
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : t('committee.announce.error'),
        'error'
      )
    }
  }

  const isDraftView = viewStatus === 'draft'

  const columns = useMemo(
    () =>
      createAnnounceProjectsColumns({
        selectedProjects: state.selectedProjects,
        onToggleProject: toggleProject,
        t,
        showSelection: isDraftView,
      }),
    [state.selectedProjects, toggleProject, t, isDraftView]
  )

  const headerActions = isDraftView ? (
    <div className="flex items-center gap-4">
      <div className="text-sm text-muted-foreground">
        {t('committee.announce.selectedCount', { count: state.selectedProjects.size })}
      </div>
      <Button
        onClick={handleAnnounce}
        disabled={state.selectedProjects.size === 0 || announceProjectsOperation.isPending}
      >
        {announceProjectsOperation.isPending ? (
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
  ) : undefined

  const title = isDraftView
    ? t('committee.announce.approvedProjects')
    : t('committee.announce.announcedProjects') || t('committee.announce.approvedProjects')

  return (
    <>
      <BlockContent
        title={title}
        actions={headerActions}
      >
        <div className="flex gap-4 mb-4 items-center">
          <Select
            value={viewStatus}
            onValueChange={(value) => setViewStatus(value as 'draft' | 'available_for_registration')}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t('common.filterByStatus') || 'Filter by status'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">
                {t('committee.announce.projectsToAnnounce') || t('committee.announce.approvedProjects') || 'Projects to Announce'}
              </SelectItem>
              <SelectItem value="available_for_registration">
                {t('committee.announce.announcedProjects') || 'المشاريع المعلنة'}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
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
