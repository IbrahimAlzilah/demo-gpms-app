import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, DataTable } from '@/components/ui'
import { LoadingSpinner } from '@/components/common'
import { useProjectsReportData, type ReportFilters } from '../../hooks/useReports'

interface ProjectsTabProps {
  filters: ReportFilters
  onExport: (reportType: string, format: 'pdf' | 'excel') => void
}

export function ProjectsTab({ filters }: ProjectsTabProps) {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')

  const { data, isLoading, error } = useProjectsReportData({
    ...filters,
    page,
    pageSize,
    search,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        {t('common.errorLoadingData')}
      </div>
    )
  }

  const columns = [
    {
      accessorKey: 'title',
      header: t('project.title'),
    },
    {
      accessorKey: 'status',
      header: t('project.status'),
    },
    {
      accessorKey: 'specialization',
      header: t('project.specialization'),
    },
    {
      accessorKey: 'supervisor.name',
      header: t('project.supervisor'),
    },
    {
      accessorKey: 'current_students',
      header: t('project.students'),
    },
  ]

  return (
    <div className="space-y-4">
      {data.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">{t('committee.reports.total')}</div>
              <div className="text-2xl font-bold">{data.summary.total}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <DataTable
        columns={columns}
        data={data.projects || []}
        isLoading={isLoading}
        pageCount={data.pagination?.totalPages || 1}
        pageIndex={page - 1}
        pageSize={pageSize}
        onPaginationChange={(pageIndex, newPageSize) => {
          setPage(pageIndex + 1)
          setPageSize(newPageSize)
        }}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('common.search')}
      />
    </div>
  )
}
