import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAnnounceProjects as useAnnounceProjectsOperation, useUnannounceProjects } from '../hooks/useAnnounceProjectsOperations'
import { DataTable, Button, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui'
import { BlockContent, useToast, ConfirmDialog } from '@/components/common'
import { createAnnounceProjectsColumns } from '../components/table'
import { ProjectDetailsView } from '../components/ProjectDetailsView'
import { Loader2, Megaphone, AlertCircle } from 'lucide-react'
import { useAnnounceProjectsList } from './AnnounceProjectsList.hook'
import type { Project } from '@/types/project.types'

export function AnnounceProjectsList() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const announceProjectsOperation = useAnnounceProjectsOperation()
  const unannounceProjectsOperation = useUnannounceProjects()

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

  const handleRemoveClick = (project: Project) => {
    setState((prev) => ({
      ...prev,
      projectToRemove: project,
      showRemoveConfirm: true,
    }))
  }

  const handleRemoveConfirm = async () => {
    if (!state.projectToRemove) return

    try {
      await unannounceProjectsOperation.mutateAsync([state.projectToRemove.id])
      showToast(t('committee.announce.removeSuccess'), 'success')
      setState((prev) => ({
        ...prev,
        projectToRemove: null,
        showRemoveConfirm: false,
      }))
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : t('committee.announce.removeError'),
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
        onView: (project) => {
          setState((prev) => ({ ...prev, projectToViewId: project.id }))
        },
        onRemove: handleRemoveClick,
        t,
        showSelection: isDraftView,
      }),
    [state.selectedProjects, toggleProject, setState, handleRemoveClick, t, isDraftView]
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
    : t('committee.announce.announcedProjects')

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
              <SelectValue placeholder={t('common.filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">
                {t('committee.announce.approvedProjects')}
              </SelectItem>
              <SelectItem value="available_for_registration">
                {t('committee.announce.announcedProjects')}
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
            <span>{t('committee.announce.loadError')}</span>
          </div>
        </BlockContent>
      )}

      <ProjectDetailsView
        projectId={state.projectToViewId}
        open={!!state.projectToViewId}
        onClose={() => {
          setState((prev) => ({ ...prev, projectToViewId: null }))
        }}
      />

      <ConfirmDialog
        open={state.showRemoveConfirm}
        onClose={() => {
          setState((prev) => ({
            ...prev,
            projectToRemove: null,
            showRemoveConfirm: false,
          }))
        }}
        onConfirm={handleRemoveConfirm}
        title={t('committee.announce.confirmRemove')}
        description={
          state.projectToRemove
            ? t('committee.announce.confirmRemoveDescription', { title: state.projectToRemove.title })
            : ''
        }
        confirmLabel={t('common.confirm')}
        cancelLabel={t('common.cancel')}
        variant="destructive"
      />
    </>
  )
}
