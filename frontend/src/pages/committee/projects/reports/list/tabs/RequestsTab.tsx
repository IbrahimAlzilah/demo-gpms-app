import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, DataTable } from '@/components/ui'
import { LoadingSpinner } from '@/components/common'
import { useRequestsReport, type ReportFilters } from '../../hooks/useReports'

interface RequestsTabProps {
  filters: ReportFilters
  onExport: (reportType: string, format: 'pdf' | 'excel') => void
}

export function RequestsTab({ filters }: RequestsTabProps) {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')

  const { data, isLoading, error } = useRequestsReport({
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
      accessorKey: 'type',
      header: t('request.type'),
    },
    {
      accessorKey: 'status',
      header: t('request.status'),
    },
    {
      accessorKey: 'student.name',
      header: t('request.student'),
    },
    {
      accessorKey: 'project.title',
      header: t('project.title'),
    },
    {
      accessorKey: 'created_at',
      header: t('common.createdAt'),
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
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">{t('common.approved')}</div>
              <div className="text-2xl font-bold">{data.summary.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">{t('common.rejected')}</div>
              <div className="text-2xl font-bold">{data.summary.rejected}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">{t('committee.reports.approvalRate')}</div>
              <div className="text-2xl font-bold">{data.summary.approval_rate}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      <DataTable
        columns={columns}
        data={data.requests || []}
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
