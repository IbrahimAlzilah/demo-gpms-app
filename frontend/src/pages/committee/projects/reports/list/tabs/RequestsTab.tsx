import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle, DataTable } from '@/components/ui'
import { LoadingSpinner, StatusBadge } from '@/components/common'
import { useRequestsReport } from '../../hooks/useReports'
import type { ReportFilters } from '../../api/report.service'
import { FileText, CheckCircle, XCircle, Percent } from 'lucide-react'

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

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString()
  }

  const columns = [
    {
      accessorKey: 'type',
      header: t('request.type'),
      cell: ({ row }: any) => <span className="font-medium">{t(`request.types.${row.original.type}`) || row.original.type}</span>
    },
    {
      accessorKey: 'status',
      header: t('request.statusLabel'),
      cell: ({ row }: any) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'student.name',
      header: t('request.student'),
      cell: ({ row }: any) => row.original.student?.name || '-'
    },
    {
      accessorKey: 'project.title',
      header: t('project.title'),
      cell: ({ row }: any) => row.original.project?.title || <span className="text-muted-foreground">-</span>
    },
    {
      accessorKey: 'created_at',
      header: t('common.createdAt'),
      cell: ({ row }: any) => formatDate(row.original.created_at)
    },
  ]

  return (
    <div className="space-y-6">
      {data.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('committee.reports.total')}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('common.approved')}</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.approved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('common.rejected')}</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.rejected}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('committee.reports.approvalRate')}</CardTitle>
              <Percent className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.approval_rate}%</div>
              <div className="h-1.5 w-full bg-secondary/30 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${data.summary.approval_rate > 70 ? 'bg-green-600' : data.summary.approval_rate > 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${data.summary.approval_rate}%` }}
                />
              </div>
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
