import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useAnnounceProjects } from '../hooks/useProjectAnnouncement'
import { DataTable, Button } from '@/components/ui'
import { BlockContent, useToast } from '@/components/common'
import { useDataTable } from '@/hooks/useDataTable'
import { committeeProjectService } from '../api/project.service'
import { createProjectAnnouncementColumns } from './ProjectAnnouncementTableColumns'
import { Loader2, Megaphone, AlertCircle } from 'lucide-react'

export function ProjectAnnouncement() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const announceProjects = useAnnounceProjects()
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set())

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
    queryKey: ['committee-projects-announce', 'draft'],
    queryFn: (params) => committeeProjectService.getTableData(params, 'draft'),
    initialPageSize: 10,
    enableServerSide: true,
  })

  const toggleProject = useCallback((projectId: string) => {
    setSelectedProjects((prev) => {
      const newSelected = new Set(prev)
      if (newSelected.has(projectId)) {
        newSelected.delete(projectId)
      } else {
        newSelected.add(projectId)
      }
      return newSelected
    })
  }, [])

  const handleAnnounce = async () => {
    if (selectedProjects.size === 0) {
      showToast(t('committee.announce.selectAtLeastOne'), 'warning')
      return
    }

    try {
      await announceProjects.mutateAsync(Array.from(selectedProjects))
      showToast(t('committee.announce.success'), 'success')
      setSelectedProjects(new Set())
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
        selectedProjects,
        onToggleProject: toggleProject,
        t,
      }),
    [selectedProjects, toggleProject, t]
  )

  const headerActions = (
    <div className="flex items-center gap-4">
      <div className="text-sm text-muted-foreground">
        {t('committee.announce.selectedCount', { count: selectedProjects.size })}
      </div>
      <Button
        onClick={handleAnnounce}
        disabled={selectedProjects.size === 0 || announceProjects.isPending}
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
          searchPlaceholder={t('committee.announce.searchPlaceholder') || 'البحث في المشاريع...'}
          enableFiltering={true}
          enableViews={true}
          emptyMessage={t('committee.announce.noProjects')}
        />
      </BlockContent>

      {error && (
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

