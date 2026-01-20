import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Project } from '@/types/project.types'
import { DataTable } from '@/components/ui/data-table'
import { createProjectColumns } from '../table'
import { useDataTable } from '@/hooks/useDataTable'
import { projectService } from '../../api/project.service'
import { useStudentRegistrations } from '../../hooks/useProjects'

interface ProjectBrowserProps {
  onSelectProject?: (project: Project) => void
  onViewRejection?: (project: Project, registration: any) => void
  studentGroup?: any
  groupLoading?: boolean
}

export function ProjectBrowser({ onSelectProject, onViewRejection, studentGroup, groupLoading }: ProjectBrowserProps) {
  const { t } = useTranslation()
  const { data: registrations } = useStudentRegistrations()

  const {
    data: projects,
    totalCount,
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
    queryKey: ['available-projects-table'],
    queryFn: (params) => {
      // Filter to only available projects
      const filters = { ...params?.filters, status: 'available_for_registration' }
      return projectService.getTableData({ ...params, filters })
    },
    initialPageSize: 10,
    enableServerSide: true,
  })

  // Create a map of projectId -> registration for quick lookup
  const registrationMap = useMemo(() => {
    if (!registrations) return new Map()
    const map = new Map()
    registrations.forEach((reg) => {
      map.set(reg.projectId, reg)
    })
    return map
  }, [registrations])

  const columns = useMemo(
    () =>
      createProjectColumns({
        onSelectProject,
        onViewRejection,
        t,
        registrationMap,
        studentGroup,
        groupLoading,
      }),
    [onSelectProject, onViewRejection, t, registrationMap, studentGroup, groupLoading]
  )

  return (
    <DataTable
      columns={columns}
      data={projects}
      isLoading={isLoading}
      error={error}
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
      enableFiltering={true}
      enableViews={true}
      emptyMessage={t('project.noAvailableProjects')}
    />
  )
}
