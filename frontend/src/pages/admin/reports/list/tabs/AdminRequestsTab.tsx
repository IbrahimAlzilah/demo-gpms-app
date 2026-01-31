import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle, DataTable } from '@/components/ui'
import { LoadingSpinner, StatusBadge } from '@/components/common'
import { useAdminRequestsReport } from '../../hooks/useReports'
import type { ReportFilters } from '../../api/report.service'

interface AdminRequestsTabProps {
  filters: ReportFilters
}

export function AdminRequestsTab({ filters }: AdminRequestsTabProps) {
  const { t } = useTranslation()
  const { data, isLoading, error } = useAdminRequestsReport(filters)

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

  const formatDate = (d: string | { format?: (s: string) => string }) => {
    if (!d) return '-'
    if (typeof d === 'string') return new Date(d).toLocaleDateString()
    return (d as any).format?.('Y-m-d') ?? '-'
  }

  const requests = data.requests || []
  const reqItems = Array.isArray(requests) ? requests : []

  const columns = [
    {
      accessorKey: 'type',
      header: t('request.type'),
      cell: ({ row }: { row: { original: any } }) => (
        <span className="font-medium">{t(`request.types.${row.original.type}`) || row.original.type}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: t('request.status'),
      cell: ({ row }: { row: { original: any } }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'student',
      header: t('request.student'),
      cell: ({ row }: { row: { original: any } }) => row.original.student?.name || '-',
    },
    {
      accessorKey: 'project',
      header: t('project.title'),
      cell: ({ row }: { row: { original: any } }) => row.original.project?.title || <span className="text-muted-foreground">-</span>,
    },
    {
      accessorKey: 'created_at',
      header: t('common.createdAt'),
      cell: ({ row }: { row: { original: any } }) => formatDate(row.original.created_at),
    },
  ]

  return (
    <div className="space-y-6">
      {data.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('committee.reports.total')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('common.approved')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{data.summary.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('common.rejected')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{data.summary.rejected}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('common.pending')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{data.summary.pending}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('committee.reports.approvalRate')}: {data.summary.approval_rate}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <DataTable
        columns={columns}
        data={reqItems}
        isLoading={isLoading}
        enableFiltering={false}
        enableViews={false}
      />
    </div>
  )
}
