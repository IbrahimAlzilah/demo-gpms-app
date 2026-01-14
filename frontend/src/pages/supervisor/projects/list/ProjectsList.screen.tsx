import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { DataTable } from '@/components/ui'
import { BlockContent } from '@/components/common'
import { AlertCircle } from 'lucide-react'
import { createProjectColumns } from '../components/table'
import { useProjectsList } from './ProjectsList.hook'
import type { Project } from '@/types/project.types'

interface ProjectsListProps {
  onProjectSelect?: (project: Project) => void
}

export function ProjectsList({ onProjectSelect }: ProjectsListProps = {}) {
  const navigate = useNavigate()
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
    t,
  } = useProjectsList()

  const columns = useMemo(
    () => createProjectColumns({ t, onProjectSelect, navigate }),
    [t, onProjectSelect, navigate]
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
          enableFiltering={true}
          enableViews={true}
          emptyMessage={t('supervisor.noProjects')}
        />
      </BlockContent>

      {data.error && (
        <BlockContent variant="container" className="border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{t('supervisor.loadError')}</span>
          </div>
        </BlockContent>
      )}
    </>
  )
}
